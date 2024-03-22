import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import createQuiz from "@/actions/createQuiz";
import createQuestion, { QuizDataType } from "@/actions/createQuestion";

/***********************************************************
 * OpanAIのAPIを呼び出し、クイズの問題、解答、選択肢を生成。
 * 生成したクイズをPrisma経由でDBに保存
 ***********************************************************/

const openAi = new OpenAI();

// クイズの問題、解答、選択肢の生成
const functions = [
  {
    name: "Quiz",
    description: "Generate few multiple choice questions.",
    parameters: {
      type: "object",
      properties: {
        quizzes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "question",
              },
              answer: {
                type: "string",
                description: "answer",
              },
              option1: {
                type: "string",
                description: "dummy answer",
              },
              option2: {
                type: "string",
                description: "dummy answer",
              },
              option3: {
                type: "string",
                description: "dummy answer",
              },
            },
            required: ["question", "answer", "option1", "option2", "option3"],
          },
        },
      },
      required: ["quizzes"],
    },
  },
];

type QuizType = {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
};

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    //リクエストボディ取得
    const body = await req.json();
    //リクエストボディからuserId, topic, level, language, amountを取得
    const { userId, topic, level, language, amount } = body;

    console.log(body);

    //ChatGPTのAPI呼び出し
    //responseの出力オブジェクトはこちらを参考=>https://platform.openai.com/docs/api-reference/chat/create
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI that is able to generate multiple choice questions and answers.",
        },
        {
          role: "user",
          content: `Generate ${amount} random ${level} multiple choice questions about ${topic} in ${language}.`,
        },
      ],
      //モデルがJSON入力を生成する関数のリスト
      functions,
      //関数呼び出し
      function_call: {
        name: "Quiz",
      },
    });

    //トークン数チェック
    if (response.usage) {
      //入力と出力の合計トークン数
      console.log(response.usage.total_tokens);
    }

    //メッセージ取得
    //回答メッセージ(choises)の０番目を取得
    const responseMessage = response.choices[0].message;
    if (!responseMessage) {
      return new NextResponse("Message Error", { status: 404 });
    }

    //FunctionCallingチェック
    if (!responseMessage.function_call) {
      return new NextResponse("Function Call Arguments Error", { status: 404 });
    }

    //引数チェック
    if (!responseMessage.function_call.arguments) {
      return new NextResponse("Function Call Arguments Error", { status: 500 });
    }

    //引数取得
    const functionCallArguments = JSON.parse(
      responseMessage.function_call.arguments
    );

    //クイズ取得
    const quizzes: QuizType[] = functionCallArguments.quizzes;
    if (quizzes.length === 0) {
      return new NextResponse("クイズが生成できませんでした", { status: 404 });
    }

    //クイズ保存
    const responseQuiz = await createQuiz({
      userId,
      topic,
      level,
      language,
      startedAt: new Date(),
    });
    if (!responseQuiz) {
      return NextResponse.json(
        { message: "クイズ保存に失敗しました" },
        { status: 404 }
      );
    }

    // 選択肢をシャッフル(Fisher-Yates)
    const shuffle = <T>(array: T[]): T[] => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    //質問データを作成
    const quizData: QuizDataType[] = quizzes.map((quiz) => {
      const options = shuffle([
        quiz.option1,
        quiz.option2,
        quiz.option3,
        quiz.answer,
      ]);

      return {
        question: quiz.question,
        answer: quiz.answer,
        options: JSON.stringify(options),
        quizId: responseQuiz.id,
      };
    });

    //質問データを保存
    await createQuestion({ data: quizData });

    return NextResponse.json({ quizId: responseQuiz.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", { status: 500 });
  }
}
