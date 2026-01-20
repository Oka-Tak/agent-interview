import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

// サブスクリプション情報取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { recruiterId: session.user.recruiterId },
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: "サブスクリプションがありません",
      });
    }

    const planInfo = PLANS[subscription.planType as keyof typeof PLANS];

    return NextResponse.json({
      subscription: {
        ...subscription,
        planName: planInfo.name,
        priceMonthly: planInfo.priceMonthly,
        additionalPointPrice: planInfo.additionalPointPrice,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
