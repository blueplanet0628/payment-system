"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import stripePromise from "../utils/stripe";
import dynamic from "next/dynamic";

// Dynamically import the Header component
const Header = dynamic(() => import("../components/Header"), { ssr: false });

interface User {
  email: string;
  plan: string;
  baseLimit: number;
  extraSheets: number;
  name: string;
  sheetId: string;
  date: string;
}

interface BillingProps {
  user: User;
}

const Billing: React.FC<BillingProps> = ({ user }) => {
  const [extraSheets, setExtraSheets] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const stripe = useStripe();
  const elements = useElements();
  const [sheetUrl, setSheetUrl] = useState<string | null>(null); // Store Google Sheet URL
  const router = useRouter();

  // ✅ Generate Google Sheet URL from sheetId
  useEffect(() => {
    if (user.sheetId) {
      setSheetUrl(`https://docs.google.com/spreadsheets/d/${user.sheetId}`);
    }
  }, [user.sheetId]);

  // ✅ Fetch Stripe payment intent when extraSheets is updated
  useEffect(() => {
    if (extraSheets > 0) {
      setLoading(true);
      axios
        .post(`${process.env.URL}api/create-payment-intent`, { extraSheets })
        .then((response) => {
          setClientSecret(response.data.clientSecret);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching client secret:", error);
          setLoading(false);
        });
    }
  }, [extraSheets]);

  const handlePurchase = async () => {
    if (!stripe || !elements || !clientSecret) {
      console.log("Stripe, Elements, or ClientSecret are not ready.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("カード情報の入力欄が見つかりません。");
      return;
    }

    if (extraSheets <= 0) {
      alert("追加するシート数を入力してください。");
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error("Payment failed:", error.message);
        alert("支払いに失敗しました: " + error.message);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment success");

      const res = await axios.post(`${process.env.URL}api/update-sheets`, {
          email: user.email,
          extraSheets,
        });
       
       if(res.status == 200) {
        router.push("/success");
       }
        alert("支払い完了！追加シートが反映されました。");
      } else {
        alert("予期しない支払い状態: " + paymentIntent.status);
      }
    } catch (error: any) {
      console.error("Error during payment confirmation:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80 transform transition-transform hover:scale-105">
      <h2 className="text-xl font-semibold text-center mb-4">追加シートの購入</h2>
      <p className="text-center text-gray-600">現在のプラン: {user.plan}</p>
      <p className="text-center text-gray-600 mb-4">使用済みシート: {Number(user.baseLimit) + Number(user.extraSheets)}</p>

      {/* ✅ Fixed Google Sheet Link Display */}
      {sheetUrl && (
        <div className="mb-4 text-center">
          <h3 className="font-medium">Google Sheet</h3>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all max-w-full block"
          >
            {sheetUrl}
          </a>
        </div>
      )}

      <input
        type="number"
        value={extraSheets}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value < 0) return;
          setExtraSheets(value);
        }}
        disabled={loading}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
        placeholder="追加シート数"
      />

      <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                color: "#000000",
                backgroundColor: "#ffffff",
                fontSize: "16px",
                "::placeholder": { color: "#999999" },
              },
              invalid: { color: "#ff4d4d" },
            },
          }}
        />
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {loading ? "処理中..." : "追加シートを購入"}
      </button>
    </div>

  );
};

const BillingPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [storedData, setStoredData] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    axios
      .get(`${process.env.URL}api/google-sheet`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [router]);

 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("email");
      setStoredData(data);
    }

    const userRole = localStorage.getItem("role");
    if (userRole === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const user = users.find((user) => user.email === storedData);

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        <h1 className="text-xl">ユーザー情報が見つかりません。ログインしてください。</h1>
      </div>
    );
  }
  
  interface Props {
    user: {
      baseLimit: number;
      extraSheets: number;
      sheetId: string;
    };
  }
  
  const InstagramTable: React.FC<Props> = ({ user }) => {
    const [showModal, setShowModal] = useState(false);
    const [newId, setNewId] = useState('');
    const [instagramId, setInstagramId] = useState<string[]>([]);
    const [editId, setEditId] = useState(''); // For storing Instagram ID to edit
  
    // Fetch Instagram IDs from the backend
    useEffect(() => {
      const fetchInstagramIds = async () => {
        if (!user?.sheetId) return; // Ensure sheetId exists
  
        try {
          const res = await axios.get(`${process.env.URL}api/instagram-id/${user.sheetId}`);
          console.log(res.data, 'Fetched Instagram IDs');
          setInstagramId(res.data.instagramIds || []); // Ensure data is an array
        } catch (error) {
          console.error('Error fetching Instagram IDs:', error);
        }
      };
  
      fetchInstagramIds();
    }, [user?.sheetId]); // Runs when `user.sheetId` changes
  
    // Calculate the maximum allowed Instagram IDs
    const maxLimit = Number(user.baseLimit) + Number(user.extraSheets);
  
    // Save a new Instagram ID
    const handleSave = async () => {
      if (!newId.trim() || !user?.sheetId) return;
  
      // Check if the number of Instagram IDs exceeds the max limit
      if (instagramId.length >= maxLimit) {
        alert(`You can only add ${maxLimit} Instagram IDs. Limit exceeded!`);
        return;
      }
  
      try {
        const response = await axios.post(`${process.env.URL}api/save-instagram-id`, {
          id: newId,
          sheet: user.sheetId,
        });
  
        console.log(response.data, 'Response after saving');
  
        if (response.status === 200) {
          const res = await axios.get(`${process.env.URL}api/instagram-id/${user.sheetId}`);
          console.log(res, 'res');
  
          setInstagramId(res.data.instagramIds || []);
        }
  
        setShowModal(false);
        setNewId('');
      } catch (error) {
        console.error('Error saving Instagram ID:', error);
      }
    };
  
    // Edit Instagram ID
    const edit = async (instagramId: string) => {
      setEditId(instagramId); // Set the ID to edit
  
      // Open the modal to edit the Instagram ID
      setShowModal(true);
    };
  
    // Save edited Instagram ID
    const handleEditSave = async () => {
      if (!editId.trim() || !newId.trim() || !user?.sheetId) return;
  
      try {
        const response = await axios.post(`${process.env.URL}api/edit-instagram-id`, {
          oldId: editId,
          newId: newId,
          sheet: user.sheetId,
        });
  
        console.log(response.data, 'Response after editing');
  
        if (response.status === 200) {
          const res = await axios.get(`${process.env.URL}api/instagram-id/${user.sheetId}`);
          console.log(res, 'res');
  
          setInstagramId(res.data.instagramIds || []);
        }
  
        setShowModal(false);
        setNewId('');
        setEditId(''); // Reset edit state
      } catch (error) {
        console.error('Error editing Instagram ID:', error);
      }
    };
  
    // Delete Instagram ID
    const del = async (instagramId: string) => {
      try {
        const response = await axios.post(`${process.env.URL}api/delete-instagram-id`, {
          id: instagramId,
          sheet: user.sheetId,
        });
  
        console.log(response.data, 'Response after deleting');
  
        if (response.status === 200) {
          const res = await axios.get(`${process.env.URL}api/instagram-id/${user.sheetId}`);
          console.log(res, 'res');
  
          setInstagramId(res.data.instagramIds || []);
        }
      } catch (error) {
        console.error('Error deleting Instagram ID:', error);
      }
    };
  
    return (
      <div className="w-1/2 bg-[#444444] p-4 rounded-lg shadow-lg text-black">
        <h2 className="text-xl font-semibold mb-4 text-[#999999]">インスタグラムID</h2>
  
        {/* "New" Button to open the modal */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#000000] text-white px-4 py-2 rounded-lg mb-4 hover:bg-[#999999]"
        >
          新しい
        </button>
  
        {/* Table for displaying stored Instagram IDs */}
        <table className="w-full border border-[#999999]">
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="border border-[#999999] p-2">番号</th>
              <th className="border border-[#999999] p-2">インスタグラムID</th>
              <th className="border border-[#999999] p-2">制御</th>
            </tr>
          </thead>
          <tbody>
            {instagramId.length > 0 ? (
              instagramId.map((ele, index) => (
                <tr key={index} className="border border-[#999999]">
                  <td className="p-2 text-center text-white">{index + 1}</td>
                  <td className="p-2 text-center text-white">{ele}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => edit(ele)} className="text-[#999999]">
                    編集
                    </button>
                    <button onClick={() => del(ele)} className="text-[#999999] ml-2">
                    削除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-white">
                データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
  
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#444444] p-6 rounded-lg shadow-lg w-96 text-white">
              <h2 className="text-xl font-semibold mb-4 text-[#999999]">
                {editId ? 'Instagram IDを編集' : 'Instagram IDを入力してください'}
              </h2>
              <input
                type="text"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full p-2 border border-[#999999] rounded-md mb-4 bg-[#444444] text-white"
                placeholder="Instagram IDを入力してください"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-[#999999] text-black px-4 py-2 rounded-lg"
                >
                  キャンセル
                </button>
                <button
                  onClick={editId ? handleEditSave : handleSave}
                  className="bg-[#000000] text-white px-4 py-2 rounded-lg hover:bg-[#999999]"
                >
                  {editId ? '変更を保存' : 'セーブ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
    

  return (
    <>
      <Header isAdmin={isAdmin} />
      <div className="flex flex-wrap md:flex-nowrap justify-center items-start min-h-screen bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 gap-6">
        {/* Left Section: Billing */}
        <Elements stripe={stripePromise}>
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition-all w-96">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <p className="text-lg">{user.email}</p>
              <p className="mt-4 text-md">プラン: {user.plan}</p>
              <p className="mt-2 text-sm">登録日: {user.date}</p>
            </div>
            <Billing user={user} />
          </div>
        </Elements>

        {/* Right Section: InstagramTable */}
        <InstagramTable user={user} />
      </div>
    </>
  );
};

export default BillingPage;
