"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import stripePromise from "../utils/stripe";
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../components/Header'), {
  ssr: false,
});

const Home: React.FC = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const userRole = localStorage.getItem("role");
    setIsAdmin(userRole === "admin");
  }, [router]);

  const handleSubscribe = async (plan: string) => {
    const email = localStorage.getItem("email");
    
    try {
      const response = await axios.post(
        `/api/create-checkout-session`,
        { plan, email },
        { headers: { "Content-Type": "application/json" } }
      );

      const session = response.data;

      if (session.id) {
        const stripe = await stripePromise;
        if (!stripe) {
          alert("Stripeの初期化に失敗しました。");
          return;
        }
       const response = await stripe.redirectToCheckout({ sessionId: session.id });
       
        
      } else {
        alert("決済の開始に失敗しました。");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("エラーが発生しました。");
    }
  };

  return (
    <>
      <Header isAdmin={isAdmin} />
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-white p-6">
        <h1 className="text-3xl font-bold mb-8 text-[#999999]">サブスクリプションプランを選択</h1>
        <div className="flex gap-8">
          {[{ plan: "A", price: 10000, sheets: 10, description: "シンプルなプランで、1ユーザーに10枚のシートアクセスを提供します。基本的な機能で十分なユーザー向けです。" },
            { plan: "B", price: 30000, sheets: 30, description: "30枚のシートに加え、メール送信や拡張サポート機能も含まれています。より多くのシートと追加機能を必要とするユーザー向けです。" },
            { plan: "C", price: 50000, sheets: 50, description: "50枚のシートと、高度なカスタマイズオプションを提供します。大規模な使用向けで、プレミアムサポートとすべての機能にアクセスできます。" }
          ].map(({ plan, price, sheets, description }) => (
            <div
              key={plan}
              className="bg-[#444444] text-white p-8 rounded-xl shadow-lg w-64 transform transition-all hover:scale-105 hover:bg-[#555555] border border-[#999999]"
            >
              <h2 className="text-2xl font-semibold text-[#999999]">プラン {plan}</h2>
              <p className="text-lg font-bold my-4">¥{price.toLocaleString()} /月</p>
              <p className="text-sm text-[#999999] mb-4">シート数: {sheets}枚</p>
              <p className="text-sm text-[#cccccc]">{description}</p>
              <button
                onClick={() => handleSubscribe(plan)}
                className="mt-4 w-full bg-[#000000] text-white px-6 py-3 rounded-lg border border-[#999999] hover:bg-[#222222] transition-all"
              >
                プランを選択
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
