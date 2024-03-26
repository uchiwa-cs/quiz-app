import Image from "next/image";
import getQuizzes from "@/actions/getQuizzes";
import QuizItem from "@/components/quiz/QuizItem";

const Home = async () => {
  const quizzes = await getQuizzes();

  if (quizzes.length === 0) {
    return <div className="text-center">クイズはありません</div>;
  }
  return (
    <div className="space-y-2">
      {quizzes.map((quiz) => {
        return <QuizItem key={quiz.id} quiz={quiz} />;
      })}
    </div>
  );
};

export default Home;
