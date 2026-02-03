import type { AccountType } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/api-utils";
import { ConflictError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
  name: z.string().min(1, "名前は必須です"),
  accountType: z.enum(["USER", "RECRUITER"], {
    message: "アカウントタイプはUSERまたはRECRUITERを指定してください",
  }),
});

export const POST = withValidation(registerSchema, async (body, req) => {
  const { email, password, name, accountType } = body;

  if (accountType === "RECRUITER") {
    return NextResponse.json(
      {
        error:
          "採用担当者の新規登録は招待制です。管理者に招待を依頼してください。",
      },
      { status: 403 },
    );
  }

  const existingAccount = await prisma.account.findUnique({
    where: { email },
  });

  if (existingAccount) {
    throw new ConflictError("このメールアドレスは既に登録されています");
  }

  const passwordHash = await hash(password, 12);

  const account = await prisma.account.create({
    data: {
      email,
      passwordHash,
      accountType: accountType as AccountType,
      user: {
        create: { name },
      },
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json({ account }, { status: 201 });
});
