import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const prompt = `
以下の教材から4択問題を5問作成してください。
必ず以下のJSON形式のみで返してください。余分な文字やマークダウンは不要です。

{
  "questions": [
    {
      "id": "1",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "answerIndex": 0
    }
  ]
}

answerIndexは正解の選択肢のインデックス（0〜3）です。
`;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get("text") as string | null;
  const image = formData.get("image") as File | null;

  if (!text && !image) {
    return NextResponse.json(
      { error: "テキストまたは画像が必要です" },
      { status: 400 }
    );
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  let result;

  if (image) {
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: image.type as "image/jpeg" | "image/png" | "image/webp",
          data: base64,
        },
      },
    ]);
  } else {
    result = await model.generateContent(prompt + `\n教材テキスト：\n${text}`);
  }

  const responseText = result.response.text();
  const cleaned = responseText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return NextResponse.json(parsed);
}
