"use client";
import { useState } from "react";
import { Question, InputMode } from "@/types";

export default function Generate() {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    setQuestions([]);

    try {
      const formData = new FormData();
      if (mode === "text") {
        formData.append("text", text);
      } else if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      setQuestions(data.questions);
    } catch (e) {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  const canGenerate = mode === "text" ? text.trim() !== "" : image !== null;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">問題生成</h1>

      {/* モード切り替え */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "text"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setMode("text")}
        >
          テキスト入力
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "image"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setMode("image")}
        >
          画像アップロード
        </button>
      </div>

      {/* テキスト入力 */}
      {mode === "text" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">教材テキスト</label>
          <textarea
            className="w-full border rounded-lg p-3 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ここに教材テキストを貼り付けてください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      )}

      {/* 画像アップロード */}
      {mode === "image" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">参考書の画像</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
          />
          {preview && (
            <img
              src={preview}
              alt="プレビュー"
              className="mt-4 rounded-lg max-h-64 object-contain border"
            />
          )}
        </div>
      )}

      {/* エラー表示 */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* 生成ボタン */}
      <button
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? "生成中..." : "問題を生成する"}
      </button>

      {/* 生成された問題 */}
      {questions.length > 0 && (
        <div className="mt-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold">生成された問題</h2>
          {questions.map((q, i) => (
            <div key={q.id} className="border rounded-lg p-4">
              <p className="font-medium mb-3">
                Q{i + 1}. {q.question}
              </p>
              <ul className="flex flex-col gap-2">
                {q.choices.map((choice, j) => (
                  <li
                    key={j}
                    className={`p-2 rounded-lg border text-sm ${
                      j === q.answerIndex
                        ? "bg-green-50 border-green-400 text-green-700"
                        : "bg-gray-50 text-gray-900"
                    }`}
                  >
                    {j === q.answerIndex ? "✅ " : `${j + 1}. `}
                    {choice}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
