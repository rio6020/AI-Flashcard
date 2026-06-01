import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const basePrompt = `
必ず以下のJSON形式のみで返してください。余分な文字やマークダウンは不要です。

{
  "questions": [
    {
      "id": "1",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "answerIndex": 0,
      "answer": "正解のテキスト"
    }
  ]
}

answerIndexは正解の選択肢のインデックス（0〜3）です。
answerは正解の文字列です。
`;

const teachingPrompt =
  `以下の教材から4択問題を5問作成してください。\n` + basePrompt;
const similarPrompt =
  `以下の問題と同じ形式・難易度・ジャンルで類似の4択問題を5問作成してください。元の問題をそのまま含めないでください。\n` +
  basePrompt;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get("text") as string | null;
  const image = formData.get("image") as File | null;
  const mode = formData.get("mode") as string | null;
  const subject = formData.get("subject") as string;
  const unit = formData.get("unit") as string | null;

  if (!text && !image) {
    return NextResponse.json(
      { error: "テキストまたは画像が必要です" },
      { status: 400 }
    );
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = mode === "similar" ? similarPrompt : teachingPrompt;

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
    result = await model.generateContent(prompt + `\n入力：\n${text}`);
  }

  const responseText = result.response.text();
  const cleaned = responseText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const savedQuestions = await Promise.all(
    parsed.questions.map(
      (q: {
        question: string;
        choices: string[];
        answerIndex: number;
        answer: string;
      }) =>
        prisma.question.create({
          data: {
            question: q.question,
            choices: q.choices,
            answerIndex: q.answerIndex,
            answer: q.answer ?? "",
            subject,
            unit: unit || null,
            cardState: {
              create: {
                easeFactor: 2.5,
                interval: 1,
                repetitions: 0,
                nextReviewAt: new Date(),
              },
            },
          },
          include: { cardState: true },
        })
    )
  );

  return NextResponse.json({ questions: savedQuestions });
}
