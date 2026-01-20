import Stripe from "stripe";

const isLocalDev = process.env.STRIPE_MOCK_ENABLED === "true";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_mock",
  {
    // @ts-expect-error stripe-mock may use different API version
    apiVersion: "2025-04-30.basil",
    ...(isLocalDev && {
      host: "localhost",
      port: 12111,
      protocol: "http",
    }),
  },
);

// プラン設定
export const PLANS = {
  LIGHT: {
    name: "ライト",
    priceMonthly: 29800,
    pointsIncluded: 100,
    pointUnitPrice: 298,
    additionalPointPrice: 500,
  },
  STANDARD: {
    name: "スタンダード",
    priceMonthly: 79800,
    pointsIncluded: 300,
    pointUnitPrice: 266,
    additionalPointPrice: 400,
  },
  ENTERPRISE: {
    name: "エンタープライズ",
    priceMonthly: 198000,
    pointsIncluded: 1000,
    pointUnitPrice: 198,
    additionalPointPrice: 300,
  },
} as const;

// ポイント消費量
export const POINT_COSTS = {
  CONVERSATION: 1, // エージェント会話
  INTEREST: 0, // 興味表明（無料）
  CONTACT_DISCLOSURE: 10, // 連絡先開示
  MESSAGE_SEND: 3, // メッセージ送信
} as const;

export type PlanType = keyof typeof PLANS;
