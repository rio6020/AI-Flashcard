import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const unit = searchParams.get("unit");

  const questions = await prisma.question.findMany({
    where: {
      ...(subject ? { subject } : {}),
      ...(unit ? { unit } : {}),
    },
    include: { cardState: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ questions });
}
