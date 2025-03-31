"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== repassword) {
      setError("パスワードが一致しません");
      return;
    }

    try {
      console.log(email, name, 'eee');
      const response = await axios.post("http://localhost:3000/register", {
        email,
        password,
        name
      });

      if (response.status === 200) {
        router.push("/auth/login"); // 登録成功後にログインページへ遷移
      } else {
        throw new Error("登録に失敗しました");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "エラーが発生しました");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#999999] to-[#444444]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#000000] mb-6">新規登録</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="名前"
            className="w-full p-3 border border-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#444444]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            className="w-full p-3 border border-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#444444]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            className="w-full p-3 border border-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#444444]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="パスワード再入力"
            className="w-full p-3 border border-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#444444]"
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-[#444444] text-white py-3 rounded-lg hover:bg-[#000000] transition-all">
            登録する
          </button>
        </form>
        <p className="text-center mt-6 text-[#444444]">
          すでにアカウントをお持ちですか？{" "}
          <a href="/auth/login" className="text-[#444444] hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
