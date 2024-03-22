"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz, Question } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { differenceInSeconds } from "date-fns";
import { formatTimeDelta } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  LapTimerIcon,
} from "@radix-ui/react-icons";
import type { VariantProps } from "class-variance-authority";
import axios from "axios";
import exp from "constants";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type QuestionProps = {
  quiz: Quiz & { questions: Question[] };
};

const Question: React.FC<QuestionProps> = ({ quiz }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  //ユーザーの選択した内容を格納する状態変数
  const [selectAnswer, setSelectAnswer] = useState<string>("");
  //DBから正解の選択肢を取得してセットする状態変数
  const [answer, setAnswer] = useState<string>("");
  const [now, setNow] = useState<Date | null>(null);

  //現在の問題を表示させる
  const currentQuestion = useMemo(() => {
    return quiz.questions[questionNumber];
  }, [questionNumber, quiz.questions]);

  //選択肢の表示
  const options = useMemo(() => {
    //現在の問題が存在しない場合は何も表示しない
    if (!currentQuestion) return [];
    //現在の問題のoptions(選択肢)が存在しない場合は何も表示しない
    if (!currentQuestion.options) return [];

    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

  //回答時間
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //答え合わせAPI
  const { mutate: checkAnswer, isLoading: loadingCheckAnswer } = useMutation({
    mutationFn: async (index: number) => {
      const response = await axios.post(`/api/checkAnswer`, {
        questionId: currentQuestion.id,
        userAnswer: options[index],
      });
      return response.data;
    },
  });

  //クイズ終了API
  const { mutate: finishQuiz } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/finishQuiz`, {
        quizId: quiz.id,
      });
    },
  });

  //次の問題へ
  const handleNext = useCallback(() => {
    //選択リセット
    setSelectAnswer("");
    //回答リセット
    setAnswer("");

    if (questionNumber + 1 === quiz.questions.length) {
      //クイズ終了API呼び出し
      finishQuiz(undefined, {
        onSuccess: () => {
          //クイズ終了後、結果ページに遷移
          router.push(`/result/${quiz.id}`);
          //キャッシュクリア
          router.refresh();
        },
      });
    } else {
      //次の問題へ
      setQuestionNumber((prevQuestionNumber) => prevQuestionNumber + 1);
    }
  }, [questionNumber, quiz.questions.length, quiz.id, router, finishQuiz]);

  //回答
  const handleAnswer = useCallback(
    (index: number, option: string) => {
      //選択肢をセット
      setSelectAnswer(option);

      //答え合わせAPI呼び出し
      checkAnswer(index, {
        onSuccess: ({ answer }) => {
          setAnswer(answer);
        },
        onError: (error) => {
          console.error(error);
          toast({
            title: "回答の送信に失敗しました",
            description: "もう一度お試しください",
            variant: "destructive",
          });
        },
      });
    },
    [checkAnswer, toast]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>{quiz.topic}</div>
          {now && (
            <div className="flex items-center space-x-2 font-normal text-sm">
              <LapTimerIcon className="h-5 w-5" />
              <div className="text-sm text-gray-500">
                {formatTimeDelta(differenceInSeconds(now, quiz.startedAt))}
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <Separator className="mb-5" />

      <CardContent>
        <div className="font-bold text-2xl mb-5">
          {/* 問題番号と問題を表示 */}
          {questionNumber + 1}.{currentQuestion.question}
        </div>

        {options.map((option, index) => {
          let variantValue: ButtonVariant = "outline";
          let IconComponent = null;

          //option(選択肢)が選択された状態の場合
          if (selectAnswer) {
            //API呼び出し中の場合
            if (loadingCheckAnswer) {
              variantValue = "secondary";
              //API呼び出しが完了した場合
            } else if (answer) {
              //正解の選択肢の表示
              if (answer === option) {
                variantValue = "correct";
                IconComponent = CheckCircledIcon;
                //不正解の選択肢の表示
              } else if (selectAnswer === option) {
                variantValue = "incorrect";
                IconComponent = CrossCircledIcon;
              }
            }
          }
          return (
            <div key={index}>
              <Button
                onClick={() => handleAnswer(index, option)}
                disabled={!!selectAnswer || loadingCheckAnswer}
                variant={variantValue}
                className="justify-between w-full py-5 mb-2 shadow-none disabled:opacity-100"
              >
                {option}
                {IconComponent && (
                  <IconComponent
                    className={`w-5 h-5 ${
                      variantValue === "correct"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  />
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>

      <Separator className="mb-5" />

      <CardFooter className="justify-between">
        <div>
          {questionNumber + 1}of{quiz.questions.length} Questions
        </div>

        {selectAnswer && !loadingCheckAnswer && (
          <div>
            <Button onClick={handleNext}>
              {questionNumber + 1 === quiz.questions.length
                ? "結果発表"
                : "次の問題へ"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default Question;
