import { PointTransactionType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRecruiterValidation } from "@/lib/api-utils";
import { NoSubscriptionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

const purchasePointsSchema = z.object({
  amount: z
    .number()
    .int("ポイント数は整数で指定してください")
    .min(10, "最低10ポイントから購入できます"),
});

export const POST = withRecruiterValidation(
  purchasePointsSchema,
  async (body, req, session) => {
    const { amount } = body;
    const recruiterId = session.user.recruiterId;

    // サブスクリプションを確認
    const subscription = await prisma.subscription.findUnique({
      where: { recruiterId },
    });

    if (!subscription) {
      throw new NoSubscriptionError(
        "サブスクリプションがありません。先にプランを選択してください。",
      );
    }

    const planInfo = PLANS[subscription.planType as keyof typeof PLANS];
    const totalPrice = amount * planInfo.additionalPointPrice;

    // トランザクションでポイント追加
    const result = await prisma.$transaction(async (tx) => {
      const newBalance = subscription.pointBalance + amount;

      // サブスクリプションの残高を更新
      const updatedSubscription = await tx.subscription.update({
        where: { recruiterId },
        data: { pointBalance: newBalance },
      });

      // 取引履歴を記録
      await tx.pointTransaction.create({
        data: {
          recruiterId,
          type: PointTransactionType.PURCHASE,
          amount,
          balance: newBalance,
          description: `${amount}ポイント追加購入 (¥${totalPrice.toLocaleString()})`,
        },
      });

      return { newBalance, updatedSubscription };
    });

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      purchased: amount,
      price: totalPrice,
    });
  },
);
