'use client'; // ボタンのクリックなどの動きを出すために必須

import { useState } from 'react';

export default function Home() {
  // 画面の「状態（データ）」を管理する変数
  const [goal, setGoal] = useState("子供にカッコいい背中を見せるために、ベンチプレス100kg達成する！");
  const [advice, setAdvice] = useState("上のボタンを押して、今日の先生を選んでね！");
  const [currentCoach, setCurrentCoach] = useState("");

  // ボタンを押したときの動き
  const handleCoachClick = (coachType: 'ofuzake' | 'uranai' | 'ijin' | 'sparta', coachName: string) => {
    setCurrentCoach(coachName);
    setAdvice(dummyQuotes[coachType]);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4">
      
      {/* 1. ヘッダー */}
      <header className="my-6">
        <h1 className="text-3xl font-extrabold text-amber-500 tracking-wider">筋トレパートナー</h1>
      </header>

      {/* 2. 目標設定エリア */}
      <section className="w-full max-w-md bg-slate-800 border-2 border-amber-500/30 rounded-2xl p-5 mb-8 shadow-xl text-center">
        <p className="text-xs text-slate-400 font-bold mb-1">MY GOAL / 目的意識</p>
        <p className="text-lg font-medium text-amber-100 italic">「{goal}」</p>
      </section>

      {/* 3. 4人の先生ボタンエリア */}
      <section className="w-full max-w-md mb-8">
        <p className="text-sm font-bold text-slate-400 mb-3 text-center">今日の相談相手を選ぶ</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleCoachClick('ofuzake', '🧚‍♂️ おふざけ先生')} className="p-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl font-bold transition shadow-lg text-center cursor-pointer">
            🧚‍♂️ おふざけ
          </button>
          <button onClick={() => handleCoachClick('uranai', '🔮 占い好き先生')} className="p-4 bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-xl font-bold transition shadow-lg text-center cursor-pointer">
            🔮 占い好き
          </button>
          <button onClick={() => handleCoachClick('ijin', '🏆 スポーツ偉人先生')} className="p-4 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-bold transition shadow-lg text-center cursor-pointer">
            🏆 スポーツ偉人
          </button>
          <button onClick={() => handleCoachClick('sparta', '👹 スパルタ先生')} className="p-4 bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl font-bold transition shadow-lg text-center cursor-pointer">
            👹 スパルタ
          </button>
        </div>
      </section>

      {/* 4. アドバイス表示エリア */}
      <section className="w-full max-w-md bg-slate-800 rounded-2xl p-6 min-h-[150px] flex flex-col justify-between shadow-xl border border-slate-700">
        <div>
          {currentCoach && <p className="text-sm font-bold text-amber-400 mb-2">{currentCoach}からの言葉：</p>}
          <p className="text-base leading-relaxed text-slate-200 whitespace-pre-wrap">{advice}</p>
        </div>
        
        {/* 筋トレ完了ボタン（セリフが出ているときだけ表示） */}
        {currentCoach && (
          <button className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-xl transition shadow-md active:scale-95 cursor-pointer">
            よし、今日の筋トレ完了！
          </button>
        )}
      </section>

    </main>
  );
}

// 開発用の仮データ（Step 4でSupabaseから取得するように書き換えます）
const dummyQuotes = {
  ofuzake: "お疲れサマッシュ！今日サボったらプロテインがただの美味しい大豆粉になっちゃうよ？ジムの床を踏むだけで大金星！",
  uranai: "今日のあなたのラッキー筋肉は【広背筋】です。北東を向いてラットプルダウンをすると運気が爆上がりする予感！",
  ijin: "「準備というのは、言い訳を排除すること。」\n――さあ、自分だけの目標のために、今日の1セットを始めよう。",
  sparta: "言い訳の天才になるな！明日やろうはバカ野郎だ！やるって決めたのは誰だ？今すぐ動け、筋肉が泣いているぞ！"
};