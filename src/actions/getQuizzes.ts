import prisma from "@/lib/prisma";

const getQuizzes = async () => {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: {
        startedAt: "desc",
      },
      include: {
        questions: true,
        user: { select: { name: true, image: true } },
      },
    });

    return quizzes;
  } catch (error) {
    console.error(error);

    return [];
  }
};

export default getQuizzes;
