import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      {/* ヒーロー */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">AI Flashcard</h1>
        <p className="text-gray-400 text-lg mb-8">
          AIが教材から問題を自動生成。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/generate"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          >
            問題を生成する
          </Link>
          <Link
            href="/study"
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
          >
            学習を始める
          </Link>
        </div>
      </div>

      {/* 特徴 */}
      <div className="grid grid-cols-3 gap-6 py-8">
        <div className="border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">🤖 AIで問題を自動生成</h2>
          <p className="text-gray-400 text-sm">
            教材のテキストや参考書の写真をアップロードするだけで、AIが自動で問題を作成します。
          </p>
        </div>
        <div className="border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">🧠 復習スケジュール</h2>
          <p className="text-gray-400 text-sm">
            理解度を記録して、復習が必要な問題を自動で管理します。
          </p>
        </div>
        <div className="border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">📊 学習進捗の可視化</h2>
          <p className="text-gray-400 text-sm">
            正解率や連続学習日数など、学習の進捗をダッシュボードで確認できます。
          </p>
        </div>
      </div>
    </main>
  );
}
