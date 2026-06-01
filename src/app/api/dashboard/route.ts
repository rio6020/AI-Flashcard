import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  // 総問題数
  const totalQuestions = await prisma.question.count();

  // 今日の学習数
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const studiedToday = await prisma.studyLog.count({
    where: { studiedAt: { gte: todayStart } },
  });

  // 正解率
  const totalLogs = await prisma.studyLog.count();
  const correctLogs = await prisma.studyLog.count({
    where: { isCorrect: true },
  });
  const correctRate =
    totalLogs === 0 ? 0 : Math.round((correctLogs / totalLogs) * 100);

  // 連続学習日数
  const streak = await calcStreak();

  // 週間学習データ
  const weeklyData = await getWeeklyData();

  // 要復習の問題数
  const reviewCount = await prisma.cardState.count({
    where: {
      OR: [{ repetitions: 0 }, { nextReviewAt: { lte: now } }],
    },
  });

  // 過去の学習セッション（日付ごと）
  const pastSessions = await getPastSessions();

  return NextResponse.json({
    totalQuestions,
    studiedToday,
    correctRate,
    streak,
    weeklyData,
    reviewCount,
    pastSessions,
  });
}

async function calcStreak(): Promise<number> {
  const logs = await prisma.studyLog.findMany({
    select: { studiedAt: true },
    orderBy: { studiedAt: "desc" },
  });

  if (logs.length === 0) return 0;

  const days = new Set(
    logs.map((l) => l.studiedAt.toISOString().split("T")[0])
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (days.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function getWeeklyData() {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const correct = await prisma.studyLog.count({
      where: { studiedAt: { gte: start, lte: end }, isCorrect: true },
    });
    const incorrect = await prisma.studyLog.count({
      where: { studiedAt: { gte: start, lte: end }, isCorrect: false },
    });

    result.push({ day: days[start.getDay()], correct, incorrect });
  }

  return result;
}

async function getPastSessions() {
  const logs = await prisma.studyLog.findMany({
    select: { studiedAt: true },
    orderBy: { studiedAt: "desc" },
  });

  const sessionMap = new Map<string, number>();
  for (const log of logs) {
    const key = log.studiedAt.toISOString().split("T")[0];
    sessionMap.set(key, (sessionMap.get(key) ?? 0) + 1);
  }

  return Array.from(sessionMap.entries())
    .slice(0, 5)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      }),
      count,
    }));
}
