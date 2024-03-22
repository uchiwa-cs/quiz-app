import prisma from "@/lib/prisma";
import { Question } from "@prisma/client";

export type QuizDataType = {
  question: string;
  answer: string;
  options: string;
  quizId: string;
};
const createQuestion = async ({ data }: { data: QuizDataType[] }) => {
  try {
    const questions = await prisma.question.createMany({
      data,
    });
    return questions;
  } catch (error) {
    console.error(error);
  }
};

export default createQuestion;
