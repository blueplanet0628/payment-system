// pages/payment-success.tsx

import Link from 'next/link';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg w-96">
        <h1 className="text-4xl font-bold mb-4">🎉 ありがとうございます！</h1>
        <p className="text-lg mb-6">お支払いが成功しました。ご購読ありがとうございます。</p>
        <Link href="/home">
          <a className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            ホームに戻る
          </a>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
