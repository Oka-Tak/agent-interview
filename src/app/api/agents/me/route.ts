import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgentStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agentProfile.findUnique({
      where: { userId: session.user.userId },
    });

    const fragments = await prisma.fragment.findMany({
      where: { userId: session.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ agent, fragments });
  } catch (error) {
    console.error("Get agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { systemPrompt, status } = body;

    const updateData: { systemPrompt?: string; status?: AgentStatus } = {};

    if (systemPrompt !== undefined) {
      updateData.systemPrompt = systemPrompt;
    }

    if (status !== undefined) {
      updateData.status = status as AgentStatus;
    }

    const agent = await prisma.agentProfile.update({
      where: { userId: session.user.userId },
      data: updateData,
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
