import { type NextRequest, NextResponse } from "next/server";
import { withRecruiterAuth } from "@/lib/api-utils";
import { getPointHistory } from "@/lib/points";

// ポイント履歴取得
export const GET = withRecruiterAuth(async (req, session) => {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const history = await getPointHistory(
    session.user.recruiterId,
    limit,
    offset,
  );

  return NextResponse.json({ history });
});
