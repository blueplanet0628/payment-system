"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${process.env.URL}api/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        const email = response.data.email;
        console.log(token, email, 'eee');
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('email', email);
        localStorage.setItem('role', 'user');
        
        router.push("/home"); // 登録成功後にログインページへ遷移
      } else {
        throw new Error("登録に失敗しました");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "エラーが発生しました");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#999999] to-[#444444]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#000000]">ログイン</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button type="submit" className="w-full bg-[#444444] text-white py-3 rounded-lg hover:bg-[#000000] transition-all">
            ログイン
          </button>
        </form>
        <p className="text-center mt-6 text-[#444444]">
          アカウントをお持ちでないですか？{" "}
          <a href="/auth/register" className="text-[#444444] hover:underline">
            登録する
          </a>
        </p>
      </div>
    </div>
  );
}
