import getQuestionById from "@/actions/getQuestionById";
import updateQuestionAnswer from "@/actions/updateQuestionAnswer";
import { NextResponse, NextRequest } from "next/server";

//答え合わせ
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    //リクエストボディの取得
    const body = await req.json();
    const { userAnswer, questionId } = body;

    //クイズ問題の取得
    const question = await getQuestionById({ questionId });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    //答え合わせ
    const isCorrect = question.answer === userAnswer;

    //Questionテーブルのユーザー回答部分をアップデート
    await updateQuestionAnswer({ questionId, userAnswer, isCorrect });

    //Questionの答えを返す
    return NextResponse.json({ answer: question.answer });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", {
      status: 500,
    });
  }
}
