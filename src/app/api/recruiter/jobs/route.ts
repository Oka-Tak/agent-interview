import type { JobStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 求人一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as JobStatus | null;

    const jobs = await prisma.jobPosting.findMany({
      where: {
        recruiterId: session.user.recruiterId,
        ...(status && { status }),
      },
      include: {
        _count: {
          select: {
            matches: true,
            pipelines: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 求人作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      preferredSkills,
      skills,
      keywords,
      employmentType,
      experienceLevel,
      location,
      salaryMin,
      salaryMax,
      isRemote,
      status,
    } = body;

    if (!title || !description || !employmentType || !experienceLevel) {
      return NextResponse.json(
        {
          error:
            "Required fields: title, description, employmentType, experienceLevel",
        },
        { status: 400 },
      );
    }

    const job = await prisma.jobPosting.create({
      data: {
        recruiterId: session.user.recruiterId,
        title,
        description,
        requirements,
        preferredSkills,
        skills: skills || [],
        keywords: keywords || [],
        employmentType,
        experienceLevel,
        location,
        salaryMin,
        salaryMax,
        isRemote: isRemote || false,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
