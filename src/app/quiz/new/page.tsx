import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth/options";
import QuizNew from "@/components/quiz/QuizNew";

const QuizNewPage = async () => {
  //サーバーサイドでセッション情報取得
  const session = await getAuthSession();

  //セッションが空なら
  if (!session) {
    //ログイン画面にリダイレクト
    redirect("/login");
  }
  return <QuizNew userId={session.user.id} />;
};

export default QuizNewPage;
