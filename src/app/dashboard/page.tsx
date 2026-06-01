"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  totalQuestions: number;
  studiedToday: number;
  correctRate: number;
  streak: number;
  weeklyData: { day: string; correct: number; incorrect: number }[];
  reviewCount: number;
  pastSessions: { date: string; count: number }[];
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
      setIsLoading(false);
    }
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  if (!data) return null;

  const maxBar = Math.max(
    ...data.weeklyData.map((d) => d.correct + d.incorrect),
    1
  );

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">総問題数</p>
          <p className="text-3xl font-bold mt-1">{data.totalQuestions}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">今日の学習数</p>
          <p className="text-3xl font-bold mt-1">{data.studiedToday}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">正解率</p>
          <p className="text-3xl font-bold mt-1">{data.correctRate}%</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">連続学習日数</p>
          <p className="text-3xl font-bold mt-1">{data.streak}日 🔥</p>
        </div>
      </div>

      {/* 週間学習グラフ */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">今週の学習</h2>
        <div className="flex items-end gap-2 h-32">
          {data.weeklyData.map((d) => (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full flex flex-col justify-end gap-0.5"
                style={{ height: "100px" }}
              >
                <div
                  className="w-full bg-red-200 rounded-sm"
                  style={{ height: `${(d.incorrect / maxBar) * 100}px` }}
                />
                <div
                  className="w-full bg-blue-400 rounded-sm"
                  style={{ height: `${(d.correct / maxBar) * 100}px` }}
                />
              </div>
              <span className="text-xs text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-400 rounded-sm inline-block" />
            正解
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-200 rounded-sm inline-block" />
            不正解
          </span>
        </div>
      </div>

      {/* 復習しよう */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">復習しよう</h2>
        {data.reviewCount === 0 ? (
          <p className="text-gray-500 text-sm">
            復習が必要な問題はありません🎉
          </p>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">🔴 要復習</span>
              <span className="text-gray-500 text-sm ml-2">
                {data.reviewCount}問
              </span>
            </div>
            <button
              className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-600"
              onClick={() => router.push("/study")}
            >
              復習する →
            </button>
          </div>
        )}
      </div>

      {/* 過去の学習 */}
      <div className="border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">過去の学習</h2>
        {data.pastSessions.length === 0 ? (
          <p className="text-gray-500 text-sm">まだ学習履歴がありません</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.pastSessions.map((s) => (
              <li key={s.date} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{s.date}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {s.count}問
                  </span>
                </div>
                <button
                  className="bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200"
                  onClick={() => router.push("/study")}
                >
                  復習する →
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
