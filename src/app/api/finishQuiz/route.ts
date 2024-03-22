import { NextResponse, NextRequest } from "next/server";
import updateQuiz from "@/actions/updateQuiz";
import getQuizById from "@/actions/getQuizById";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    //リクエストボディ取得
    const body = await req.json();
    //クイズID取得
    const { quizId } = body;

    //クイズの取得
    const quiz = await getQuizById({ quizId });

    //クイズが存在しない場合
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    //クイズ終了時刻がデータに未だ存在しない場合
    if (!quiz.finishedAt) {
      //クイズの終了日時を更新
      await updateQuiz({ quizId, finishedAt: new Date() });
    }

    return NextResponse.json("finish!", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", {
      status: 500,
    });
  }
}
