import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subjects = await prisma.question.findMany({
    select: { subject: true, unit: true },
    distinct: ["subject", "unit"],
    orderBy: { subject: "asc" },
  });

  return NextResponse.json({ subjects });
}
