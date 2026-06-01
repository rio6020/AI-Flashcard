"use client";
import { useState, useEffect } from "react";
import { Question } from "@/types";
import { CardResult } from "@/lib/sm2";
import { checkAnswer } from "@/lib/normalize";

export default function Study() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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

  function handleSubmit() {
    if (!userAnswer.trim()) return;
    const correct = checkAnswer(userAnswer, currentQuestion.answer);
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setTimeout(() => saveLogAndNext("again", false), 1500);
    }
  }

  async function saveLogAndNext(result: CardResult, correct: boolean) {
    await fetch("/api/study-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        result,
        isCorrect: correct,
      }),
    });
    goNext();
  }

  function goNext() {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
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
            setUserAnswer("");
            setIsAnswered(false);
            setIsCorrect(false);
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
        <p className="text-lg font-medium text-white">
          {currentQuestion.question}
        </p>
      </div>

      {/* 回答入力 */}
      {!isAnswered && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="答えを入力してください"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={userAnswer.trim() === ""}
          >
            回答する
          </button>
        </div>
      )}

      {/* 回答後 */}
      {isAnswered && (
        <div className="flex flex-col gap-3">
          <div
            className={`p-4 rounded-lg ${
              isCorrect
                ? "bg-green-50 border border-green-400"
                : "bg-red-50 border border-red-400"
            }`}
          >
            <p
              className={`font-medium ${
                isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {isCorrect ? "✅ 正解！" : "❌ 不正解"}
            </p>
            {!isCorrect && (
              <p className="text-red-600 text-sm mt-1">
                正解：{currentQuestion.answer}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              あなたの回答：{userAnswer}
            </p>
          </div>

          {isCorrect && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => saveLogAndNext("hard", true)}
                className="py-2 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200"
              >
                難しい
              </button>
              <button
                onClick={() => saveLogAndNext("easy", true)}
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
