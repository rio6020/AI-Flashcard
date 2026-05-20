export type Question = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

export type InputMode = "text" | "image";
