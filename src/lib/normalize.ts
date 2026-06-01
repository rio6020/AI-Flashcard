export function normalizeAnswer(str: string): string {
  return (
    str
      .trim()
      // 空白を除去
      .replace(/\s/g, "")
      // 全角→半角
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      // 小文字に統一
      .toLowerCase()
      // 下付き数字を通常数字に変換
      .replace(/₀/g, "0")
      .replace(/₁/g, "1")
      .replace(/₂/g, "2")
      .replace(/₃/g, "3")
      .replace(/₄/g, "4")
      .replace(/₅/g, "5")
      .replace(/₆/g, "6")
      .replace(/₇/g, "7")
      .replace(/₈/g, "8")
      .replace(/₉/g, "9")
  );
}

export function checkAnswer(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
