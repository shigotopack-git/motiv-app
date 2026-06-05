"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Supabaseクライアントの初期化
// ※環境変数（NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY）は .env.local に設定してください
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// コーチ5名の定義（idをテーブルの coach_type の値と一致させています）
const COACHES = [
  { id: "cheer_leader", name: "チアリーダー", emoji: "📣", accentColor: "bg-pink-500 hover:bg-pink-600" },
  { id: "tsundere", name: "ツンデレ幼馴染", emoji: "💢", accentColor: "bg-orange-500 hover:bg-orange-600" },
  { id: "butler", name: "有能な執事", emoji: "☕", accentColor: "bg-slate-700 hover:bg-slate-800" },
  { id: "hero", name: "スポーツ界の偉人", emoji: "🏆", accentColor: "bg-amber-500 hover:bg-amber-600" },
  { id: "sparta", name: "スパルタコーチ", emoji: "🔥", accentColor: "bg-red-600 hover:bg-red-700" },
];

export default function Home() {
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [message, setMessage] = useState("上のボタンからコーチを選んで、喝を入れてもらいましょう！");
  const [isLoading, setIsLoading] = useState(false);

  // 指定されたコーチのセリフをSupabaseからランダムに1件取得する関数
  const fetchRandomMessage = async (coachType: string) => {
    setIsLoading(true);
    try {
      // ご指定いただいたテーブル名
      const tableName = "coach_quotes"; 

      // ① まず、対象のコーチ(coach_type)のセリフが何件あるか総数をカウント
      const { count, error: countError } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .eq("coach_type", coachType); // フィールド名: coach_type

      if (countError) throw countError;

      if (count && count > 0) {
        // ② 総数の中からランダムなインデックス（行位置）を決定
        const randomIndex = Math.floor(Math.random() * count);

        // ③ そのインデックスの1件だけをピンポイントで取得
        const { data, error: dataError } = await supabase
          .from(tableName)
          .select("*")
          .eq("coach_type", coachType)
          .range(randomIndex, randomIndex)
          .single();

        if (dataError) throw dataError;

        // ④ 取得したセリフを画面にセット（フィールド名: message）
        setMessage(data.message || "セリフの読み込みに失敗しました。"); 
      } else {
        setMessage("データが見つかりませんでした。Supabaseのテーブルを確認してください。");
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      setMessage("エラーが発生しました。RLS設定や環境変数を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // コーチ変更時の処理
  const handleCoachChange = (coach: typeof COACHES[0]) => {
    setSelectedCoach(coach);
    setMessage(`${coach.name}がスタンバイしました。下のボタンを押してください！`);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-gray-800">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 md:p-10 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-gray-900">
          🎾 テニス上達の知恵袋 🎾
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          5人の専属コーチが、あなたのモチベーションを意のままにコントロールします。
        </p>

        {/* コーチ選択タブ（5名分） */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {COACHES.map((coach) => (
            <button
              key={coach.id}
              onClick={() => handleCoachChange(coach)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedCoach.id === coach.id
                  ? "border-gray-900 bg-gray-900 text-white shadow-md transform scale-105"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-2xl mb-1">{coach.emoji}</span>
              <span className="text-xs font-bold leading-tight">{coach.name}</span>
            </button>
          ))}
        </div>

        {/* セリフ表示エリア（吹き出し風） */}
        <div className="relative bg-gray-50 rounded-2xl p-6 md:p-8 min-h-[140px] flex items-center justify-center border border-gray-100 mb-8 shadow-inner">
          <p className={`text-base md:text-lg font-medium leading-relaxed ${isLoading ? "animate-pulse text-gray-400" : "text-gray-800"}`}>
            {message}
          </p>
        </div>

        {/* アクションボタン */}
        <button
          onClick={() => fetchRandomMessage(selectedCoach.id)}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
            selectedCoach.accentColor
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "声をかけています..." : `${selectedCoach.name}に話しかける！`}
        </button>
      </div>
    </main>
  );
}