"use client";
import { useState } from "react";
import { Question, InputMode } from "@/types";

type GenerateMode = "teaching" | "similar";

export default function Generate() {
  const [generateMode, setGenerateMode] = useState<GenerateMode>("teaching");
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("数学");
  const [customSubject, setCustomSubject] = useState("");
  const [unit, setUnit] = useState("");

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
      formData.append("mode", generateMode);
      if (mode === "text") {
        formData.append("text", text);
      } else if (image) {
        formData.append("image", image);
      }
      formData.append(
        "subject",
        subject === "その他" ? customSubject : subject
      );
      formData.append("unit", unit);

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
  const canGenerate =
    (mode === "text" ? text.trim() !== "" : image !== null) &&
    (subject !== "その他" || customSubject.trim() !== "");

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">問題生成</h1>

      {/* 生成モード切り替え */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            generateMode === "teaching"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setGenerateMode("teaching")}
        >
          教材から生成
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            generateMode === "similar"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setGenerateMode("similar")}
        >
          類似問題を生成
        </button>
      </div>

      {/* 入力モード切り替え */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "text"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => setMode("text")}
        >
          テキスト入力
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "image"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => setMode("image")}
        >
          画像アップロード
        </button>
      </div>

      {/* 教科・単元 */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">教科</label>
          <div className="flex flex-wrap gap-2">
            {["数学", "英語", "理科", "社会", "国語", "その他"].map((s) => (
              <button
                key={s}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  subject === s
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {subject === "その他" && (
            <input
              type="text"
              className="mt-2 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="教科名を入力してください"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">単元</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：光合成、二次方程式など"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
      </div>

      {/* 説明文 */}
      <p className="text-sm text-gray-500 mb-4">
        {generateMode === "teaching"
          ? "教材のテキストや画像を入力すると、その内容から問題を生成します。"
          : "問題文や問題集の画像を入力すると、同じ形式・難易度の類似問題を生成します。"}
      </p>

      {/* テキスト入力 */}
      {mode === "text" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {generateMode === "teaching" ? "教材テキスト" : "問題文"}
          </label>
          <textarea
            className="w-full border rounded-lg p-3 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              generateMode === "teaching"
                ? "ここに教材テキストを貼り付けてください..."
                : "ここに問題文を貼り付けてください..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      )}

      {/* 画像アップロード */}
      {mode === "image" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {generateMode === "teaching" ? "教材の画像" : "問題集の画像"}
          </label>
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

      {/* 生成完了 */}
      {questions.length > 0 && (
        <div className="mt-8 p-6 border rounded-xl text-center">
          <p className="text-xl font-bold mb-2">
            ✅ {questions.length}問の問題が生成されました！
          </p>
          <p className="text-gray-500 text-sm mb-6">
            教科：{questions[0].subject}
            {questions[0].unit ? `　単元：${questions[0].unit}` : ""}
          </p>

          <a
            href="/study"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          >
            学習を始める →
          </a>
        </div>
      )}
    </main>
  );
}
