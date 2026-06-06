"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COACHES = [
  { id: "yuruchara", name: "ゆるキャラコーチ", emoji: "📣" },
  { id: "ofuzake", name: "おふざけコーチ", emoji: "💢" },
  { id: "uranai", name: "占い師コーチ", emoji: "🔮" },
  { id: "ijin", name: "スポーツ偉人", emoji: "🏆" },
  { id: "sparta", name: "スパルタコーチ", emoji: "🔥" },
];

export default function Home() {
  const [goalWhat, setGoalWhat] = useState("");
  const [goalWhy, setGoalWhy] = useState("");
  const [goalWhen, setGoalWhen] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [message, setMessage] = useState("ここにメッセージをもらえます");
  const [logs, setLogs] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", 1).single();
    if (profile) {
      setGoalWhat(profile.goal_what || "");
      setGoalWhy(profile.goal_why || "");
      setGoalWhen(profile.goal_when || "");
    }
    const { data: speechLogs } = await supabase.from("speechlogs").select("*").order("created_at", { ascending: false });
    if (speechLogs) setLogs(speechLogs);
  };

  useEffect(() => { if (supabaseUrl) fetchData(); }, []);

  const saveGoal = async () => {
    await supabase.from("profiles").upsert({ id: 1, goal_what: goalWhat, goal_why: goalWhy, goal_when: goalWhen, updated_at: new Date() });
    setIsEditing(false);
  };

  const fetchRandomMessage = async (coachType: string) => {
    const { data } = await supabase.from("coach_quotes").select("message").eq("coach_type", coachType);
    if (data && data.length > 0) setMessage(data[Math.floor(Math.random() * data.length)].message);
  };

  const addFavorite = async () => {
    const { data: currentLogs } = await supabase.from("speechlogs").select("id").order("created_at", { ascending: true });
    if (currentLogs && currentLogs.length >= 10) {
      await supabase.from("speechlogs").delete().eq("id", currentLogs[0].id);
    }
    await supabase.from("speechlogs").insert([{ message, coach_type: selectedCoach.name }]);
    fetchData();
  };

  const sectionTitleStyle = "text-xl font-bold text-black mb-4 text-left";
  const contentTextStyle = "font-sans text-black font-medium text-sm";

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
        
        {/* 1. 直近の目標 */}
        <h2 className={sectionTitleStyle}>🎯 直近の目標</h2>
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          {isEditing ? (
            <div className="space-y-2">
              <input value={goalWhat} onChange={(e) => setGoalWhat(e.target.value)} className="w-full p-2 rounded border text-black font-bold" placeholder="目標を入力" />
              <input value={goalWhy} onChange={(e) => setGoalWhy(e.target.value)} className={`w-full p-2 rounded border ${contentTextStyle}`} placeholder="理由を入力" />
              <input type="date" value={goalWhen} onChange={(e) => setGoalWhen(e.target.value)} className={`w-full p-2 rounded border ${contentTextStyle}`} />
              <button onClick={saveGoal} className="bg-blue-600 text-white px-4 py-1 rounded w-full font-bold">保存する</button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <p className="font-bold text-lg mb-1 text-black">{goalWhat || "クリックして目標を入力"}</p>
              <p className={contentTextStyle}>期限: {goalWhen || "未設定"}</p>
              <p className={contentTextStyle}>理由: {goalWhy || "未設定"}</p>
            </div>
          )}
        </div>

        {/* 2. コーチからのアドバイス */}
        <h2 className={sectionTitleStyle}>💡 コーチからのアドバイス</h2>
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-gray-500 text-xs mb-4">コーチを選び、下部のアドバイスボタンを押してください</p>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            {COACHES.map((coach) => (
              <button key={coach.id} onClick={() => setSelectedCoach(coach)} className={`p-2 rounded-xl border ${selectedCoach.id === coach.id ? 'bg-blue-100 border-blue-400' : 'bg-white'}`}>
                <span className="text-xl">{coach.emoji}</span>
                <p className="text-[10px] font-bold text-black mt-1">{coach.name}</p>
              </button>
            ))}
          </div>

          <button onClick={() => fetchRandomMessage(selectedCoach.id)} className="w-full py-3 bg-black text-white rounded-xl font-bold mb-4">
            アドバイスボタン
          </button>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-md font-bold text-black mb-4 text-left">{message}</p>
            <div className="flex justify-end">
              <button onClick={addFavorite} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">⭐ 心に残った言葉として残す</button>
            </div>
          </div>
        </div>

        {/* 3. 最近のログ */}
        <h2 className={sectionTitleStyle}>📜 心に残ったコーチの言葉（最近10件）</h2>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
              <p className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleDateString()}</p>
              <p className="font-bold text-black">{log.coach_type}</p>
              <p className="text-black font-medium">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}