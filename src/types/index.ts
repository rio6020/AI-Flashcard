export type Question = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  answer: string;
  subject: string;
  unit: string | null;
};

export type InputMode = "text" | "image";
