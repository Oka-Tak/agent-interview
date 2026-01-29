import { type PlanType, PointTransactionType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterId = session.user.recruiterId;
    const { planType } = await req.json();

    if (!planType || !Object.keys(PLANS).includes(planType)) {
      return NextResponse.json(
        { error: "無効なプランタイプです" },
        { status: 400 },
      );
    }

    const planInfo = PLANS[planType as keyof typeof PLANS];

    // 既存のサブスクリプションを確認
    const existingSubscription = await prisma.subscription.findUnique({
      where: { recruiterId: recruiterId },
    });

    if (existingSubscription) {
      // プラン変更
      const updatedSubscription = await prisma.subscription.update({
        where: { recruiterId: recruiterId },
        data: {
          planType: planType as PlanType,
          pointsIncluded: planInfo.pointsIncluded,
        },
      });

      return NextResponse.json({
        subscription: updatedSubscription,
        message: "プランを変更しました",
      });
    } else {
      // 新規サブスクリプション作成
      const newSubscription = await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.create({
          data: {
            recruiterId: recruiterId,
            planType: planType as PlanType,
            pointBalance: planInfo.pointsIncluded,
            pointsIncluded: planInfo.pointsIncluded,
            status: "ACTIVE",
          },
        });

        // 初回ポイント付与の履歴を記録
        await tx.pointTransaction.create({
          data: {
            recruiterId: recruiterId,
            type: PointTransactionType.GRANT,
            amount: planInfo.pointsIncluded,
            balance: planInfo.pointsIncluded,
            description: `${planInfo.name}プラン開始 - 初回ポイント付与`,
          },
        });

        return subscription;
      });

      return NextResponse.json({
        subscription: newSubscription,
        message: "プランを選択しました",
      });
    }
  } catch (error) {
    console.error("Change plan error:", error);
    return NextResponse.json(
      { error: "プラン変更に失敗しました" },
      { status: 500 },
    );
  }
}
