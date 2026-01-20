import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 求人詳細取得
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.jobPosting.findFirst({
      where: {
        id,
        recruiterId: session.user.recruiterId,
      },
      include: {
        matches: {
          include: {
            agent: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { score: "desc" },
          take: 20,
        },
        pipelines: {
          include: {
            agent: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            matches: true,
            pipelines: true,
            watches: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 求人更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id,
        recruiterId: session.user.recruiterId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.requirements !== undefined && {
          requirements: body.requirements,
        }),
        ...(body.preferredSkills !== undefined && {
          preferredSkills: body.preferredSkills,
        }),
        ...(body.skills && { skills: body.skills }),
        ...(body.keywords && { keywords: body.keywords }),
        ...(body.employmentType && { employmentType: body.employmentType }),
        ...(body.experienceLevel && { experienceLevel: body.experienceLevel }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin }),
        ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax }),
        ...(body.isRemote !== undefined && { isRemote: body.isRemote }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 求人削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.recruiterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id,
        recruiterId: session.user.recruiterId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
