import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkPointBalance,
  consumePointsWithOperations,
  InsufficientPointsError,
  NoSubscriptionError,
} from "@/lib/points";
import { prisma } from "@/lib/prisma";

// 連絡先開示（10pt消費）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interestId } = await params;

    // 興味表明を取得
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            accountId: true,
          },
        },
      },
    });

    if (!interest) {
      return NextResponse.json(
        { error: "興味表明が見つかりません" },
        { status: 404 },
      );
    }

    if (interest.recruiterId !== session.user.recruiterId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (interest.status === "CONTACT_DISCLOSED") {
      // 既に開示済みの場合は連絡先を返す
      return NextResponse.json({
        contact: {
          name: interest.user.name,
          email: interest.user.email,
          phone: interest.user.phone,
        },
        alreadyDisclosed: true,
      });
    }

    // ポイントチェック
    const pointCheck = await checkPointBalance(
      session.user.recruiterId,
      "CONTACT_DISCLOSURE",
    );
    if (!pointCheck.canProceed) {
      return NextResponse.json(
        {
          error: "ポイントが不足しています",
          required: pointCheck.required,
          available: pointCheck.available,
        },
        { status: 402 },
      );
    }

    // ポイント消費、ステータス更新、通知作成を単一トランザクションで実行
    await consumePointsWithOperations(
      session.user.recruiterId,
      "CONTACT_DISCLOSURE",
      async (tx) => {
        // ステータスを更新
        await tx.interest.update({
          where: { id: interestId },
          data: { status: "CONTACT_DISCLOSED" },
        });

        // 求職者に通知
        await tx.notification.create({
          data: {
            accountId: interest.user.accountId,
            type: "PIPELINE_UPDATE",
            title: "連絡先が開示されました",
            body: `${session.user.companyName}に連絡先が開示されました`,
            data: {
              interestId: interest.id,
              recruiterId: session.user.recruiterId,
              companyName: session.user.companyName,
            },
          },
        });
      },
      interestId,
      `連絡先開示: ${interest.user.name}`,
    );

    return NextResponse.json({
      contact: {
        name: interest.user.name,
        email: interest.user.email,
        phone: interest.user.phone,
      },
      alreadyDisclosed: false,
    });
  } catch (error) {
    console.error("Contact disclosure error:", error);

    if (error instanceof NoSubscriptionError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }

    if (error instanceof InsufficientPointsError) {
      return NextResponse.json(
        {
          error: error.message,
          required: error.required,
          available: error.available,
        },
        { status: 402 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
