import { LanguageType, Quiz, LevelType } from "@prisma/client";
import prisma from "@/lib/prisma";

const createQuiz = async ({
  userId,
  topic,
  level,
  language,
  startedAt,
}: {
  userId: string;
  topic: string;
  level: LevelType;
  language: LanguageType;
  startedAt: Date;
}): Promise<Quiz | null> => {
  try {
    const quizes = await prisma.quiz.create({
      data: {
        userId,
        topic,
        level,
        language,
        startedAt,
      },
    });

    return quizes;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default createQuiz;
