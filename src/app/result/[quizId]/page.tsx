import getQuizById from "@/actions/getQuizById";
import QuizResult from "@/components/quiz/QuizResult";
import QuestionTable from "@/components/question/QuestionTable";

type Props = {
  params: {
    quizId: string;
  };
};

//クイズ結果ページ
const QuizDetailPage = async ({ params: { quizId } }: Props) => {
  //クイズ詳細を取得
  const quiz = await getQuizById({ quizId });
  if (!quiz) {
    return <div>クイズが見つかりません</div>;
  }
  return (
    <>
      <QuizResult quiz={quiz} />
      <QuestionTable questions={quiz.questions} />
    </>
  );
};

export default QuizDetailPage;
