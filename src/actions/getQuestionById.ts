import prisma from "@/lib/prisma";

//questionIdを受け取り、prisma経由でQuestionを返す
const getQuestionById = async ({ questionId }: { questionId: string }) => {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return null;
    }

    return question;
  } catch (error) {
    return null;
  }
};
export default getQuestionById;
