import { NextResponse } from "next/server";
import { withRecruiterAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

// サブスクリプション情報取得
export const GET = withRecruiterAuth(async (req, session) => {
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
});
