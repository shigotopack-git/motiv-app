"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COACHES = [
  { id: "yuruchara", name: "ゆるキャラ", emoji: "📣", accentColor: "bg-pink-500 hover:bg-pink-600" },
  { id: "ofuzake", name: "おふざけコーチ", emoji: "💢", accentColor: "bg-orange-500 hover:bg-orange-600" },
  { id: "uranai", name: "筋肉占い師", emoji: "🔮", accentColor: "bg-purple-600 hover:bg-purple-700" },
  { id: "ijin", name: "スポーツ偉人", emoji: "🏆", accentColor: "bg-amber-500 hover:bg-amber-600" },
  { id: "sparta", name: "スパルタコーチ", emoji: "🔥", accentColor: "bg-red-600 hover:bg-red-700" },
];

export default function Home() {
  // 目標用ステート
  const [goalWhat, setGoalWhat] = useState("ここに目標を入力...");
  const [goalWhy, setGoalWhy] = useState("なぜその目標を達成したいか...");
  const [isEditing, setIsEditing] = useState(false);

  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [message, setMessage] = useState("コーチを選んで、喝を入れてもらいましょう！");
  const [isLoading, setIsLoading] = useState(false);

  // 初回ロード時にDBから目標を取得（id=1の固定ユーザーと仮定）
  useEffect(() => {
    const fetchGoal = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", 1).single();
      if (data) {
        setGoalWhat(data.goal_what || "");
        setGoalWhy(data.goal_why || "");
      }
    };
    if (supabaseUrl) fetchGoal();
  }, []);

  // 目標保存処理
  const saveGoal = async () => {
    await supabase.from("profiles").upsert({ id: 1, goal_what: goalWhat, goal_why: goalWhy, updated_at: new Date() });
    setIsEditing(false);
  };

  const fetchRandomMessage = async (coachType: string) => {
    setIsLoading(true);
    const { data } = await supabase.from("coach_quotes").select("message").eq("coach_type", coachType);
    if (data && data.length > 0) {
        const randomMsg = data[Math.floor(Math.random() * data.length)].message;
        setMessage(randomMsg);
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
        
        {/* 目標表示エリア */}
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-2">🎯 今日の目標</h2>
          {isEditing ? (
            <div className="space-y-2">
              <input value={goalWhat} onChange={(e) => setGoalWhat(e.target.value)} className="w-full p-2 rounded" placeholder="目標は何？" />
              <input value={goalWhy} onChange={(e) => setGoalWhy(e.target.value)} className="w-full p-2 rounded" placeholder="なぜ達成するの？" />
              <button onClick={saveGoal} className="bg-blue-600 text-white px-4 py-1 rounded">保存</button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <p className="font-bold text-lg">{goalWhat}</p>
              <p className="text-sm text-gray-600 italic">理由: {goalWhy}</p>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">💪 筋トレ民への応援 💪</h1>
        <p className="text-gray-500 font-bold text-center text-sm mb-8">5人のコーチが貴方を全力で応援！！</p>

        {/* 以下、前回のボタン配置と同じ */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {COACHES.map((coach) => (
            <button key={coach.id} onClick={() => setSelectedCoach(coach)} className="p-2 rounded-xl bg-gray-50 border">{coach.emoji}</button>
          ))}
        </div>

        <div className="relative bg-gray-50 rounded-2xl p-6 mb-8 text-center">
          <p>{message}</p>
        </div>

        <button onClick={() => fetchRandomMessage(selectedCoach.id)} className="w-full py-4 bg-black text-white rounded-xl">
          {selectedCoach.name}に話しかける！
        </button>
      </div>
    </main>
  );
}