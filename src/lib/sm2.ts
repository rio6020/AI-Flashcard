export type CardResult = "again" | "hard" | "good" | "easy";

export type CardState = {
  easeFactor: number; // 難易度係数（初期値2.5）
  interval: number; // 次の復習までの日数
  repetitions: number; // 正解した回数
  nextReviewAt: Date; // 次の復習日
};

export function initialCardState(): CardState {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewAt: new Date(),
  };
}

export function updateCardState(
  state: CardState,
  result: CardResult
): CardState {
  const { easeFactor, interval, repetitions } = state;

  // 結果を数値に変換（SM-2のグレード）
  const grade: Record<CardResult, number> = {
    again: 0,
    hard: 2,
    good: 4,
    easy: 5,
  };
  const q = grade[result];

  // 不正解の場合はリセット
  if (q < 3) {
    return {
      easeFactor,
      interval: 1,
      repetitions: 0,
      nextReviewAt: new Date(),
    };
  }

  // 新しいease factorを計算
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  // 新しいインターバルを計算
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  // 次の復習日を計算
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: repetitions + 1,
    nextReviewAt,
  };
}
