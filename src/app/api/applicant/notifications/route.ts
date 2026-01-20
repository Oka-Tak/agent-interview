import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 求職者の通知一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // 通知を取得（興味表明の通知も含む）
    const notifications = await prisma.notification.findMany({
      where: {
        accountId: session.user.accountId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: 50,
    });

    // 通知データを整形
    const formattedNotifications = notifications.map((n) => {
      const data = n.data as {
        interestId?: string;
        companyName?: string;
      } | null;
      return {
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.body,
        isRead: n.isRead,
        createdAt: n.createdAt,
        relatedInterest: data?.interestId
          ? {
              id: data.interestId,
              companyName: data.companyName || "",
            }
          : null,
      };
    });

    const unreadCount = formattedNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 通知を既読にする
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          accountId: session.user.accountId,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // interest-で始まるIDはスキップ（興味表明の既読管理は別途）
      const systemNotificationIds = notificationIds.filter(
        (id: string) => !id.startsWith("interest-"),
      );

      if (systemNotificationIds.length > 0) {
        await prisma.notification.updateMany({
          where: {
            id: { in: systemNotificationIds },
            accountId: session.user.accountId,
          },
          data: { isRead: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
