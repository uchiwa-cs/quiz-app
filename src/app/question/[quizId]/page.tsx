import { getAuthSession } from "@/lib/nextauth/options";
import { redirect } from "next/navigation";
import getQuizById from "@/actions/getQuizById";
import Question from "@/components/question/Question";

type Props = {
  params: {
    quizId: string;
  };
};

const QuestionPage = async ({ params: { quizId } }: Props) => {
  //認証情報取得
  const session = await getAuthSession();
  //認証ユーザー出ない場合ログインページへリダイレクト
  if (!session?.user) {
    return redirect("/login");
  }

  //クイズ詳細取得
  const quiz = await getQuizById({ quizId });

  if (!quiz) {
    return <div>クイズが見つかりません</div>;
  }

  return <Question quiz={quiz} />;
};

export default QuestionPage;
