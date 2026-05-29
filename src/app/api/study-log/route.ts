import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCardState, CardResult } from "@/lib/sm2";

export async function POST(req: NextRequest) {
  const { questionId, result, isCorrect } = await req.json();

  // 学習ログを保存
  await prisma.studyLog.create({
    data: {
      questionId,
      result,
      isCorrect,
    },
  });

  // CardStateを更新
  const cardState = await prisma.cardState.findUnique({
    where: { questionId },
  });

  if (cardState) {
    const newState = updateCardState(
      {
        easeFactor: cardState.easeFactor,
        interval: cardState.interval,
        repetitions: cardState.repetitions,
        nextReviewAt: cardState.nextReviewAt,
      },
      result as CardResult
    );

    await prisma.cardState.update({
      where: { questionId },
      data: {
        easeFactor: newState.easeFactor,
        interval: newState.interval,
        repetitions: newState.repetitions,
        nextReviewAt: newState.nextReviewAt,
      },
    });
  }

  return NextResponse.json({ success: true });
}
