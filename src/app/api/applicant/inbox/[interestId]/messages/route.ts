import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ interestId: string }>;
}

// メッセージ一覧取得
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interestId } = await context.params;

    // 自分宛ての興味表明か確認
    const interest = await prisma.interest.findFirst({
      where: {
        id: interestId,
        userId: session.user.userId,
      },
    });

    if (!interest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        interestId,
      },
      include: {
        recruiter: {
          select: { companyName: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderType: m.senderType,
        createdAt: m.createdAt,
        recruiter: m.recruiter,
        user: m.user,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// メッセージ送信
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interestId } = await context.params;
    const body = await request.json();
    const { content } = body;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "メッセージを入力してください" },
        { status: 400 },
      );
    }

    // 自分宛ての興味表明で、連絡先開示済みか確認
    const interest = await prisma.interest.findFirst({
      where: {
        id: interestId,
        userId: session.user.userId,
        status: "CONTACT_DISCLOSED",
      },
      include: {
        recruiter: {
          select: { accountId: true },
        },
        user: {
          select: { name: true },
        },
      },
    });

    if (!interest) {
      return NextResponse.json(
        { error: "メッセージを送信できません" },
        { status: 403 },
      );
    }

    const message = await prisma.directMessage.create({
      data: {
        interestId,
        senderId: session.user.userId,
        senderType: "USER",
        userId: session.user.userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // 採用担当者に通知を送信
    await prisma.notification.create({
      data: {
        accountId: interest.recruiter.accountId,
        type: "SYSTEM",
        title: "新しいメッセージ",
        body: `${interest.user.name}からメッセージが届きました`,
        data: {
          interestId,
          messageId: message.id,
        },
      },
    });

    // 興味表明のupdatedAtを更新
    await prisma.interest.update({
      where: { id: interestId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        createdAt: message.createdAt,
        user: message.user,
        recruiter: null,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
