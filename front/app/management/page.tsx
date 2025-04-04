"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../components/Header'), {
  ssr: false,
});

type User = {
  id: number;
  name: string;
  email: string;
  plan: string;
  date: string;
  state: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [buyuser, setBuyuser] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const userRole = localStorage.getItem("role");
    setIsAdmin(userRole === "admin");
  }, [router]);

  useEffect(() => {
    axios.get(`/api/users`).then((res) => setUsers(res.data));
    axios.get(`/api/google-sheet`).then((res) => setBuyuser(res.data));
  }, []);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
    if (plan !== "All") {
      filtered = filtered.filter((user) => buyuser.some((buy) => buy.email === user.email && buy.plan === plan));
    }
    setFilteredUsers(filtered);
  }, [search, plan, users, buyuser]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <>
      <Header isAdmin={isAdmin} />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#444444] text-white shadow-xl rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">ユーザー管理</h2> 
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="ユーザーを検索..." 
            className="p-2 border border-[#999999] bg-[#000000] text-white rounded-lg w-2/3 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-2 border border-[#999999] bg-[#000000] text-white rounded-lg"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="All">すべてのプラン</option> {/* All Plan */}
            <option value="Plan A">プランA</option> {/* Plan A */}
            <option value="Plan B">プランB</option> {/* Plan B */}
            <option value="Plan C">プランC</option> {/* Plan C */}
          </select>
        </div>

        <table className="w-full border border-[#999999] shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#999999] text-[#000000]">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">名前</th> {/* Name */}
              <th className="p-3 text-left">メール</th> {/* Email */}
              <th className="p-3 text-left">プラン</th> {/* Plan */}
              <th className="p-3 text-left">購入日</th> {/* Purchase Date */}
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user, index) => {
                const buyUser = buyuser.find((buy) => buy.email === user.email);
                return (
                  <tr key={index} className="border-b border-[#999999] hover:bg-[#555555]">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{buyUser ? buyUser.plan : "プランなし"}</td> {/* No plan */}
                    <td className="p-3">{buyUser ? buyUser.date : "プランを購入していません"}</td> {/* Not purchased a plan */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-3 text-center text-[#999999]">
                  ユーザーが見つかりませんでした。 {/* No users found */}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="p-2 border border-[#999999] bg-[#000000] text-white rounded-lg hover:bg-[#555555] disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-3 py-1 border border-[#999999] bg-[#000000] text-white rounded-lg">
            ページ {currentPage} / {totalPages} {/* Page {currentPage} of {totalPages} */}
          </span>
          <button
            className="p-2 border border-[#999999] bg-[#000000] text-white rounded-lg hover:bg-[#555555] disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
