"use client";
import { useRouter } from "next/navigation";

const sampleStats = {
  totalQuestions: 15,
  studiedToday: 8,
  correctRate: 73,
  streak: 3,
  weeklyData: [
    { day: "月", correct: 4, incorrect: 2 },
    { day: "火", correct: 6, incorrect: 1 },
    { day: "水", correct: 3, incorrect: 3 },
    { day: "木", correct: 7, incorrect: 0 },
    { day: "金", correct: 5, incorrect: 2 },
    { day: "土", correct: 2, incorrect: 1 },
    { day: "日", correct: 8, incorrect: 1 },
  ],
  reviewCategories: [
    { label: "🔴 まだ覚えてない", count: 5, category: "again" },
    { label: "🟡 もう少し", count: 3, category: "hard" },
  ],
  pastSessions: [
    { date: "5月20日", count: 10 },
    { date: "5月19日", count: 8 },
    { date: "5月18日", count: 6 },
  ],
};

export default function Dashboard() {
  const router = useRouter();
  const maxBar = Math.max(
    ...sampleStats.weeklyData.map((d) => d.correct + d.incorrect)
  );

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">総問題数</p>
          <p className="text-3xl font-bold mt-1">
            {sampleStats.totalQuestions}
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">今日の学習数</p>
          <p className="text-3xl font-bold mt-1">{sampleStats.studiedToday}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">正解率</p>
          <p className="text-3xl font-bold mt-1">{sampleStats.correctRate}%</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">連続学習日数</p>
          <p className="text-3xl font-bold mt-1">{sampleStats.streak}日 🔥</p>
        </div>
      </div>

      {/* 週間学習グラフ */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">今週の学習</h2>
        <div className="flex items-end gap-2 h-32">
          {sampleStats.weeklyData.map((d) => (
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
        <ul className="flex flex-col gap-3">
          {sampleStats.reviewCategories.map((r) => (
            <li key={r.category} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{r.label}</span>
                <span className="text-gray-500 text-sm ml-2">{r.count}問</span>
              </div>
              <button
                className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-600"
                onClick={() => router.push(`/study?category=${r.category}`)}
              >
                復習する →
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 過去の学習 */}
      <div className="border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">過去の学習</h2>
        <ul className="flex flex-col gap-3">
          {sampleStats.pastSessions.map((s) => (
            <li key={s.date} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{s.date}</span>
                <span className="text-gray-500 text-sm ml-2">{s.count}問</span>
              </div>
              <button
                className="bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200"
                onClick={() => router.push(`/study?date=${s.date}`)}
              >
                復習する →
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
