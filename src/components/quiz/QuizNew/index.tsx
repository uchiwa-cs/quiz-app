"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QuestionLoading from "@/components/question/QuestionLoading";

//難易度
const LEVELS = ["Easy", "Normal", "Hard"] as const;

//言語
const LANGUAGES = ["Japanese", "English"] as const;

//問題数
const MIN_AMOUNT = 3;
const MAX_AMOUNT = 10;

//入力データの検証ルールを定義
const schema = z.object({
  topic: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  level: z.enum(LEVELS),
  language: z.enum(LANGUAGES),
  amount: z
    .number()
    .min(MIN_AMOUNT)
    .max(MAX_AMOUNT, { message: `${MAX_AMOUNT}問まで生成できます` }),
});

// 入力データの型を定義
type InputType = z.infer<typeof schema>;

//QuizNewコンポーネントに渡されるpropsの型定義
type QuizNewProps = {
  userId: string;
};

//クイズ作成コンポーネント
const QuizNew: React.FC<QuizNewProps> = ({ userId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // useFormの設定
  const form = useForm<InputType>({
    //入力値の検証
    resolver: zodResolver(schema),
    //初期値の設定
    defaultValues: {
      topic: "",
      level: "Easy",
      language: "Japanese",
      amount: 3,
    },
  });

  // クイズを作成
  const quizMutation = useMutation({
    mutationFn: async ({ topic, level, language, amount }: InputType) => {
      const response = await axios.post("/api/quiz", {
        userId,
        topic,
        level,
        language,
        amount,
      });
      return response.data;
    },
  });

  //送信処理
  const onSubmitFn: SubmitHandler<InputType> = async (data) => {
    setLoading(true);

    //引数のdataを渡してquizMutationのmutationFnを実行させる
    quizMutation.mutate(data, {
      //成功した場合
      onSuccess: ({ quizId }: { quizId: String }) => {
        //問題作成後、問題詳細ページに遷移
        router.push(`/question/${quizId}`);
      },

      //失敗した場合
      onError: (error) => {
        setLoading(false);
        console.error(error);
        //エラー表示
        toast({
          title: "問題の作成に失敗しました",
          description: "テーマを変更して、もう一度送信してください",
          variant: "destructive",
        });
      },
    });
  };

  //送信処理
  // const onSubmitFn: SubmitHandler<InputType> = async (data) => {
  //   setLoading(true);

  //   try {
  //     //quizapiを呼び出し
  //     const response = await axios.post("/api/quiz", {
  //       //ユーザーIDを渡す
  //       userId,
  //       //フォームの入力データを渡す
  //       ...data,
  //     });

  //     console.log(response);

  //     //APIのレスポンスデータからquizIdを取得
  //     const { quizId } = response.data;
  //     //問題作成後、問題詳細ページに遷移
  //     router.push(`/question/${quizId}`);
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("クイズの作成に失敗しました", error);
  //     toast({
  //       title: "問題の作成に失敗しました",
  //       description: "テーマを変更して、もう一度送信してください",
  //       variant: "destructive",
  //     });
  //   }
  // };

  if (loading) {
    return <QuestionLoading />;
  }

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="text-2xl font-bold text-center mb-5">クイズ作成</div>
      {/* フォーム */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitFn)} className="space-y-8">
          {/* トピック入力 */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>テーマ</FormLabel>
                <FormControl>
                  <Input placeholder="世界遺産について" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* レベル選択 */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>難易度</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 言語選択 */}
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>言語</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 問題数 */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>問題数</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => {
                      form.setValue("amount", parseInt(event.target.value));
                    }}
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 送信ボタン */}
          <div className="text-center">
            <Button disabled={loading} type="submit">
              自動生成
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default QuizNew;
