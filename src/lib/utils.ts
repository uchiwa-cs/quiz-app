import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 秒数変換
export function formatTimeDelta(seconds: number) {
  //1時間は3600秒のため、秒数を3600で割った商を取得
  const hours = Math.floor(seconds / 3600);
  //余り秒数をsecondsに代入
  seconds %= 3600;

  //1分は60秒のため、秒数を60で割った商を取得
  const minutes = Math.floor(seconds / 60);
  //余り秒数をsecondsに代入
  seconds %= 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}
