"use client";
import { useState, useEffect } from "react";
import { Question } from "@/types";
import { CardResult, initialCardState } from "@/lib/sm2";

export default function Study() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data.questions);
      setIsLoading(false);
    }
    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500">問題を読み込み中...</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500 mb-4">問題がありません</p>
        <a href="/generate" className="text-blue-500 underline">
          問題を生成する
        </a>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === currentQuestion.answerIndex;

  async function handleSelect(index: number) {
    if (isAnswered) return;
    setSelectedIndex(index);
    const correct = index === currentQuestion.answerIndex;
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      await saveLog("again", false);
      setTimeout(() => goNext(), 1000);
    }
  }

  async function saveLog(result: CardResult, isCorrect: boolean) {
    await fetch("/api/study-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        result,
        isCorrect,
      }),
    });
  }

  async function handleNext(result: CardResult) {
    await saveLog(result, true);
    goNext();
  }

  function goNext() {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
    }
  }

  if (isFinished) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">セッション完了！</h1>
        <p className="text-gray-500 mb-6">
          {questions.length}問中{correctCount}問正解
        </p>
        <div className="text-5xl mb-8">
          {correctCount === questions.length ? "🎉" : "📚"}
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          onClick={() => {
            setCurrentIndex(0);
            setSelectedIndex(null);
            setIsFinished(false);
            setCorrectCount(0);
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
          {currentIndex + 1} / {questions.length}問
        </span>
        <span>正解: {correctCount}問</span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 問題 */}
      <div className="border rounded-xl p-6 mb-6">
        <p className="text-lg font-medium text-gray-900">
          {currentQuestion.question}
        </p>
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
