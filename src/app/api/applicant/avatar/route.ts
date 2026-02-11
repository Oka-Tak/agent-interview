import { NextResponse } from "next/server";
import { withUserAuth } from "@/lib/api-utils";
import { ValidationError } from "@/lib/errors";
import { deleteFile, uploadFile } from "@/lib/minio";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// アバター画像をアップロード
export const POST = withUserAuth(async (req, session) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ValidationError("ファイルが選択されていません");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(
      "対応していないファイル形式です。JPEG、PNG、WebPのみアップロードできます。",
    );
  }

  if (file.size > MAX_SIZE) {
    throw new ValidationError("ファイルサイズは2MB以下にしてください");
  }

  // 既存のアバターがあれば削除
  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { avatarPath: true },
  });

  if (user?.avatarPath) {
    try {
      await deleteFile(user.avatarPath);
    } catch {
      // 既存ファイルの削除失敗は無視して続行
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = await uploadFile(`avatar-${file.name}`, buffer, file.type);

  await prisma.user.update({
    where: { id: session.user.userId },
    data: { avatarPath: objectName },
  });

  return NextResponse.json({ avatarPath: objectName });
});

// アバター画像を削除
export const DELETE = withUserAuth(async (_req, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { avatarPath: true },
  });

  if (user?.avatarPath) {
    try {
      await deleteFile(user.avatarPath);
    } catch {
      // MinIOからの削除失敗は無視
    }

    await prisma.user.update({
      where: { id: session.user.userId },
      data: { avatarPath: null },
    });
  }

  return NextResponse.json({ success: true });
});
