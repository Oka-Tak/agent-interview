import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkPointBalance,
  consumePoints,
  InsufficientPointsError,
  NoSubscriptionError,
} from "@/lib/points";
import { prisma } from "@/lib/prisma";

// メッセージ一覧取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interestId } = await params;

    // 興味表明を取得してアクセス権限を確認
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
    });

    if (!interest) {
      return NextResponse.json(
        { error: "興味表明が見つかりません" },
        { status: 404 },
      );
    }

    // 採用担当者または求職者本人のみアクセス可能
    const isRecruiter = session.user.recruiterId === interest.recruiterId;
    const isUser = session.user.userId === interest.userId;

    if (!isRecruiter && !isUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.directMessage.findMany({
      where: { interestId },
      orderBy: { createdAt: "asc" },
      include: {
        recruiter: {
          select: {
            id: true,
            companyName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// メッセージ送信（採用担当者のみ3pt消費、求職者は無料）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interestId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "メッセージを入力してください" },
        { status: 400 },
      );
    }

    // 興味表明を取得
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            accountId: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            companyName: true,
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

    // 連絡先開示済みでないとメッセージ送信不可
    if (interest.status !== "CONTACT_DISCLOSED") {
      return NextResponse.json(
        { error: "連絡先が開示されていないため、メッセージを送信できません" },
        { status: 403 },
      );
    }

    const isRecruiter = session.user.recruiterId === interest.recruiterId;
    const isUser = session.user.userId === interest.userId;

    if (!isRecruiter && !isUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 採用担当者の場合はポイント消費
    if (isRecruiter && session.user.recruiterId) {
      const pointCheck = await checkPointBalance(
        session.user.recruiterId,
        "MESSAGE_SEND",
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

      await consumePoints(
        session.user.recruiterId,
        "MESSAGE_SEND",
        interestId,
        `メッセージ送信: ${interest.user.name}`,
      );
    }

    // 送信者IDを決定
    const senderId = isRecruiter
      ? session.user.recruiterId!
      : session.user.userId!;

    // メッセージ作成
    const message = await prisma.directMessage.create({
      data: {
        interestId,
        senderId,
        senderType: isRecruiter ? "RECRUITER" : "USER",
        recruiterId: isRecruiter ? session.user.recruiterId : null,
        userId: isUser ? session.user.userId : null,
        content: content.trim(),
      },
    });

    // 相手に通知
    const notificationAccountId = isRecruiter
      ? interest.user.accountId
      : interest.recruiter.accountId;

    await prisma.notification.create({
      data: {
        accountId: notificationAccountId,
        type: "SYSTEM",
        title: "新しいメッセージ",
        body: isRecruiter
          ? `${interest.recruiter.companyName}からメッセージが届きました`
          : `${interest.user.name}からメッセージが届きました`,
        data: {
          interestId,
          messageId: message.id,
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);

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
