"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COACHES = [
  { id: "yuruchara", name: "ゆるキャラ", emoji: "📣" },
  { id: "ofuzake", name: "おふざけコーチ", emoji: "💢" },
  { id: "uranai", name: "筋肉占い師", emoji: "🔮" },
  { id: "ijin", name: "スポーツ偉人", emoji: "🏆" },
  { id: "sparta", name: "スパルタコーチ", emoji: "🔥" },
];

export default function Home() {
  const [goalWhat, setGoalWhat] = useState("");
  const [goalWhy, setGoalWhy] = useState("");
  const [goalWhen, setGoalWhen] = useState(""); // 日付用ステート
  const [isEditing, setIsEditing] = useState(false);

  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [message, setMessage] = useState("コーチを選んで、喝を入れてもらいましょう！");

  useEffect(() => {
    const fetchGoal = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", 1).single();
      if (data) {
        setGoalWhat(data.goal_what || "");
        setGoalWhy(data.goal_why || "");
        setGoalWhen(data.goal_when || ""); // 日付の読み込み
      }
    };
    if (supabaseUrl) fetchGoal();
  }, []);

  const saveGoal = async () => {
    await supabase.from("profiles").upsert({ 
      id: 1, 
      goal_what: goalWhat, 
      goal_why: goalWhy, 
      goal_when: goalWhen, // 日付の保存
      updated_at: new Date() 
    });
    setIsEditing(false);
  };

  const fetchRandomMessage = async (coachType: string) => {
    const { data } = await supabase.from("coach_quotes").select("message").eq("coach_type", coachType);
    if (data && data.length > 0) {
        setMessage(data[Math.floor(Math.random() * data.length)].message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
        
        {/* 目標表示エリア */}
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-2">🎯 今日の目標</h2>
          {isEditing ? (
            <div className="space-y-2">
              <input value={goalWhat} onChange={(e) => setGoalWhat(e.target.value)} className="w-full p-2 rounded border" placeholder="目標は何？" />
              <input value={goalWhy} onChange={(e) => setGoalWhy(e.target.value)} className="w-full p-2 rounded border" placeholder="なぜ達成するの？" />
              <input type="date" value={goalWhen} onChange={(e) => setGoalWhen(e.target.value)} className="w-full p-2 rounded border" />
              <button onClick={saveGoal} className="bg-blue-600 text-white px-4 py-1 rounded w-full">保存する</button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <p className="font-bold text-lg">{goalWhat || "クリックして目標を入力"}</p>
              <p className="text-sm text-gray-600">期限: {goalWhen || "未設定"}</p>
              <p className="text-xs text-gray-400 italic mt-1">理由: {goalWhy}</p>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">💪 筋トレ民への応援 💪</h1>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {COACHES.map((coach) => (
            <button key={coach.id} onClick={() => setSelectedCoach(coach)} className={`p-2 rounded-xl border ${selectedCoach.id === coach.id ? 'bg-blue-100' : 'bg-gray-50'}`}>
              {coach.emoji}
            </button>
          ))}
        </div>

        <div className="relative bg-gray-50 rounded-2xl p-6 mb-8 text-center min-h-[100px] flex items-center justify-center">
          <p className="text-lg font-medium text-gray-800">{message}</p>
        </div>

        <button onClick={() => fetchRandomMessage(selectedCoach.id)} className="w-full py-4 bg-black text-white rounded-xl font-bold">
          {selectedCoach.name}に話しかける！
        </button>
      </div>
    </main>
  );
}