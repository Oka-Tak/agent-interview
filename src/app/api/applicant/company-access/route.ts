import { NextResponse } from "next/server";
import { z } from "zod";
import { withUserAuth } from "@/lib/api-utils";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

// GET: ユーザーの全CompanyAccess一覧を取得（企業名付き）
export const GET = withUserAuth(async (req, session) => {
  const accessList = await prisma.companyAccess.findMany({
    where: { userId: session.user.userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    accessList: accessList.map((a) => ({
      id: a.id,
      companyId: a.companyId,
      companyName: a.company.name,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
  });
});

const patchSchema = z.object({
  companyId: z.string().min(1, "companyIdは必須です"),
  status: z.enum(["ALLOW", "DENY"]),
});

// PATCH: 特定企業のアクセス設定を変更（ALLOW/DENY）
export const PATCH = withUserAuth(async (req, session) => {
  const rawBody = await req.json();
  const parsed = patchSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw new ValidationError("入力内容に問題があります", {
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  const { companyId, status } = parsed.data;

  // 企業の存在確認
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new NotFoundError("企業が見つかりません");
  }

  const access = await prisma.companyAccess.upsert({
    where: {
      userId_companyId: {
        userId: session.user.userId,
        companyId,
      },
    },
    create: {
      userId: session.user.userId,
      companyId,
      status,
    },
    update: { status },
    include: {
      company: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json({
    id: access.id,
    companyId: access.companyId,
    companyName: access.company.name,
    status: access.status,
    updatedAt: access.updatedAt,
  });
});

const deleteSchema = z.object({
  companyId: z.string().min(1, "companyIdは必須です"),
});

// DELETE: 設定を削除（デフォルトに戻す）
export const DELETE = withUserAuth(async (req, session) => {
  const rawBody = await req.json();
  const parsed = deleteSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw new ValidationError("入力内容に問題があります", {
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  const { companyId } = parsed.data;

  const existing = await prisma.companyAccess.findUnique({
    where: {
      userId_companyId: {
        userId: session.user.userId,
        companyId,
      },
    },
  });

  if (!existing) {
    throw new NotFoundError("アクセス設定が見つかりません");
  }

  await prisma.companyAccess.delete({
    where: {
      userId_companyId: {
        userId: session.user.userId,
        companyId,
      },
    },
  });

  return NextResponse.json({ deleted: true });
});
