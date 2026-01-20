import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 求職者の受信した興味表明一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interests = await prisma.interest.findMany({
      where: {
        userId: session.user.userId,
      },
      include: {
        recruiter: {
          select: {
            id: true,
            companyName: true,
          },
        },
        directMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            directMessages: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    // 未読メッセージ数を計算（後で実装するisRead機能用のプレースホルダー）
    const formattedInterests = interests.map((interest) => ({
      id: interest.id,
      status: interest.status,
      message: interest.message,
      createdAt: interest.createdAt,
      updatedAt: interest.updatedAt,
      recruiter: {
        id: interest.recruiter.id,
        companyName: interest.recruiter.companyName,
      },
      lastMessage: interest.directMessages[0] || null,
      messageCount: interest._count.directMessages,
    }));

    return NextResponse.json({
      interests: formattedInterests,
    });
  } catch (error) {
    console.error("Get inbox error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
