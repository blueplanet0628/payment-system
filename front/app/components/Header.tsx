import React from "react";
import { useRouter } from "next/navigation";

// Define the HeaderProps interface to type the component props
interface HeaderProps {
  isAdmin: boolean;  // Boolean for checking if user is an admin
}

const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data from local storage or session
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    // Redirect to login page or homepage
    router.push("/auth/login");
  };

  return (
    <header className="bg-black text-white py-4 px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">サイト名</h1>

        <nav>
          <ul className="flex space-x-6">
            {isAdmin ? (
              <>
                <li>
                  <button
                    onClick={() => router.push("/management")}
                    className="hover:underline focus:outline-none"
                    aria-label="ユーザー管理"
                  >
                    ユーザー管理
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => router.push("/user")}
                    className="hover:underline focus:outline-none"
                    aria-label="マイページ"
                  >
                    マイページ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/home")}
                    className="hover:underline focus:outline-none"
                    aria-label="ダッシュボード"
                  >
                    ダッシュボード
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="hover:underline focus:outline-none"
                aria-label="ログアウト"
              >
                ログアウト
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
