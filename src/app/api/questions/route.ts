import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: { cardState: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ questions });
}
