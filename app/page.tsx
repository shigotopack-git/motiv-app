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
  
  const [journals, setJournals] = useState<any[]>([]);
  const [newJournal, setNewJournal] = useState({ date: new Date().toISOString().split('T')[0], location: "", insight: "", selfAdvice: "" });

  const fetchData = async () => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", 1).single();
    if (profile) {
      setGoalWhat(profile.goal_what || "");
      setGoalWhy(profile.goal_why || "");
      setGoalWhen(profile.goal_when || "");
    }
    const { data: speechLogs } = await supabase.from("speechlogs").select("*").order("created_at", { ascending: false });
    if (speechLogs) setLogs(speechLogs);

    const { data: journalData } = await supabase.from("training_journal").select("*").order("log_date", { ascending: false });
    if (journalData) setJournals(journalData);
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
    await supabase.from("speechlogs").insert([{ message, coach_type: selectedCoach.name }]);
    fetchData();
  };

  const saveJournal = async () => {
    // 5件以上ある場合、一番古い（作成日時が古い）レコードを削除
    if (journals.length >= 5) {
      const oldestId = journals[journals.length - 1].id;
      await supabase.from("training_journal").delete().eq("id", oldestId);
    }

    const { error } = await supabase.from("training_journal").insert([{ 
      log_date: newJournal.date, 
      location: newJournal.location, 
      insight: newJournal.insight, 
      self_advice: newJournal.selfAdvice 
    }]);
    
    if (error) {
      alert("保存に失敗しました: " + error.message);
    } else {
      setNewJournal({ date: new Date().toISOString().split('T')[0], location: "", insight: "", selfAdvice: "" });
      fetchData();
    }
  };

  const sectionTitleStyle = "text-xl font-bold text-black mb-4 text-left";
  const contentTextStyle = "font-sans text-black font-medium text-sm";

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
        <h2 className={sectionTitleStyle}>🎯 直近の目標</h2>
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          {isEditing ? (
            <div className="space-y-2">
              <input value={goalWhat} onChange={(e) => setGoalWhat(e.target.value)} className="w-full p-2 rounded border text-black font-bold" placeholder="目標" />
              <input value={goalWhy} onChange={(e) => setGoalWhy(e.target.value)} className={`w-full p-2 rounded border ${contentTextStyle}`} placeholder="理由" />
              <input type="date" value={goalWhen} onChange={(e) => setGoalWhen(e.target.value)} className={`w-full p-2 rounded border ${contentTextStyle}`} />
              <button onClick={saveGoal} className="bg-blue-600 text-white px-4 py-1 rounded w-full font-bold">保存</button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <p className="font-bold text-lg text-black">{goalWhat || "目標を入力"}</p>
            </div>
          )}
        </div>

        <h2 className={sectionTitleStyle}>💡 コーチからのアドバイス</h2>
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <button onClick={() => fetchRandomMessage(selectedCoach.id)} className="w-full py-3 bg-black text-white rounded-xl font-bold mb-4">アドバイスを貰う</button>
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="font-bold text-black mb-4">{message}</p>
            <button onClick={addFavorite} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">保存</button>
          </div>
        </div>

        <h2 className={sectionTitleStyle}>✍️ トレーニング日誌</h2>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={newJournal.date} onChange={(e) => setNewJournal({...newJournal, date: e.target.value})} className="p-2 rounded border text-sm text-black" />
            <input type="text" placeholder="場所" value={newJournal.location} onChange={(e) => setNewJournal({...newJournal, location: e.target.value})} className="p-2 rounded border text-sm text-black" />
          </div>
          <textarea placeholder="今日の気づき" value={newJournal.insight} onChange={(e) => setNewJournal({...newJournal, insight: e.target.value})} className="w-full p-2 rounded border text-sm text-black h-20" />
          <textarea placeholder="自分へのアドバイス" value={newJournal.selfAdvice} onChange={(e) => setNewJournal({...newJournal, selfAdvice: e.target.value})} className="w-full p-2 rounded border text-sm text-black h-20" />
          <button onClick={saveJournal} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold">保存 (最大5件)</button>
          
          <div className="mt-4 space-y-2">
            {journals.map((j) => (
              <div key={j.id} className="p-3 bg-white rounded-lg border border-blue-100 text-xs">
                <p className="font-bold text-blue-600">{j.log_date} | {j.location}</p>
                <p className="text-black">{j.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}