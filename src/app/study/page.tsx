"use client";
import { useState } from "react";
import { Question } from "@/types";
import {
  CardState,
  CardResult,
  initialCardState,
  updateCardState,
} from "@/lib/sm2";

// テスト用のダミーデータ（後でAPIから取得したデータに差し替える）
const sampleQuestions: Question[] = [
  {
    id: "1",
    question: "光合成に必要なものはどれですか？",
    choices: ["水と二酸化炭素", "水と酸素", "窒素と酸素", "水素と窒素"],
    answerIndex: 0,
  },
  {
    id: "2",
    question: "植物が光合成で作り出すものはどれですか？",
    choices: ["二酸化炭素", "窒素", "ブドウ糖", "水素"],
    answerIndex: 2,
  },
  {
    id: "3",
    question: "光合成が行われる細胞内の場所はどこですか？",
    choices: ["ミトコンドリア", "葉緑体", "核", "細胞膜"],
    answerIndex: 1,
  },
];

export default function Study() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(
    Object.fromEntries(sampleQuestions.map((q) => [q.id, initialCardState()]))
  );
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = sampleQuestions[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === currentQuestion.answerIndex;

  function handleSelect(index: number) {
    if (isAnswered) return;
    setSelectedIndex(index);
    if (index === currentQuestion.answerIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      // 不正解は自動でわからなかった扱い
      setTimeout(() => handleNext("again"), 1000);
    }
  }

  function handleNext(result: CardResult) {
    // SM-2でカードの状態を更新
    const newState = updateCardState(cardStates[currentQuestion.id], result);
    setCardStates((prev) => ({ ...prev, [currentQuestion.id]: newState }));

    if (currentIndex + 1 >= sampleQuestions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
    }
  }

  // 終了画面
  if (isFinished) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">セッション完了！</h1>
        <p className="text-gray-500 mb-6">
          {sampleQuestions.length}問中{correctCount}問正解
        </p>
        <div className="text-5xl mb-8">
          {correctCount === sampleQuestions.length ? "🎉" : "📚"}
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          onClick={() => {
            setCurrentIndex(0);
            setSelectedIndex(null);
            setIsFinished(false);
            setCorrectCount(0);
            setCardStates(
              Object.fromEntries(
                sampleQuestions.map((q) => [q.id, initialCardState()])
              )
            );
          }}
        >
          もう一度
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      {/* 進捗 */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>
          {currentIndex + 1} / {sampleQuestions.length}問
        </span>
        <span>正解: {correctCount}問</span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / sampleQuestions.length) * 100}%`,
          }}
        />
      </div>

      {/* 問題 */}
      <div className="border rounded-xl p-6 mb-6">
        <p className="text-lg font-medium">{currentQuestion.question}</p>
      </div>

      {/* 選択肢 */}
      <ul className="flex flex-col gap-3 mb-6">
        {currentQuestion.choices.map((choice, i) => {
          let style = "border bg-white hover:bg-gray-50 text-gray-900";
          if (isAnswered) {
            if (i === currentQuestion.answerIndex) {
              style = "border-green-400 bg-green-50 text-green-700";
            } else if (i === selectedIndex) {
              style = "border-red-400 bg-red-50 text-red-700";
            }
          }
          return (
            <li key={i}>
              <button
                className={`w-full text-left p-4 rounded-lg border transition-all ${style}`}
                onClick={() => handleSelect(i)}
              >
                {i + 1}. {choice}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 回答後のSM-2ボタン */}
      {isAnswered && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 text-center mb-2">
            {isCorrect
              ? "✅ 正解！理解度はどのくらいでしたか？"
              : "❌ 不正解　次に進みます..."}
          </p>
          {isCorrect && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleNext("hard")}
                className="py-2 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200"
              >
                難しい
              </button>
              <button
                onClick={() => handleNext("good")}
                className="py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200"
              >
                良い
              </button>
              <button
                onClick={() => handleNext("easy")}
                className="py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
              >
                簡単
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
