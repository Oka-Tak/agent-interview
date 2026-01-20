import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 連絡先設定を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 連絡先設定を更新
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // バリデーション
    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "名前を入力してください" },
        { status: 400 },
      );
    }

    if (email !== undefined && email !== null) {
      if (typeof email !== "string") {
        return NextResponse.json(
          { error: "メールアドレスの形式が不正です" },
          { status: 400 },
        );
      }
      if (email.length > 0 && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return NextResponse.json(
          { error: "メールアドレスの形式が不正です" },
          { status: 400 },
        );
      }
    }

    if (phone !== undefined && phone !== null) {
      if (typeof phone !== "string") {
        return NextResponse.json(
          { error: "電話番号の形式が不正です" },
          { status: 400 },
        );
      }
      if (phone.length > 0 && !phone.match(/^[\d\-+().\s]+$/)) {
        return NextResponse.json(
          { error: "電話番号の形式が不正です" },
          { status: 400 },
        );
      }
    }

    const updateData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
    } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email === "" ? null : email;
    if (phone !== undefined) updateData.phone = phone === "" ? null : phone;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.userId },
      data: updateData,
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      settings: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
