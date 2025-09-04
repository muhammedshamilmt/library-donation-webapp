"use client";
import React from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

const SuccessPage = ({ searchParams }: { searchParams: Record<string, string> }) => {
  // Example: Get details from query params (adjust as needed)
  const donorName = searchParams.donorName || 'Donor';
  const amount = searchParams.amount || '0';
  const transactionId = searchParams.transactionId || 'N/A';

  // Download receipt handler
  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Library Donation Receipt', 20, 20);
    doc.setFontSize(12);
    doc.text(`Donor Name: ${donorName}`, 20, 40);
    doc.text(`Amount: ₹${amount}`, 20, 50);
    doc.text(`Transaction ID: ${transactionId}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text('Thank you for your generous donation!', 20, 90);
    doc.save(`Receipt_${transactionId}.pdf`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 flex flex-col items-center animate-fade-in">
        <h1 className="text-3xl font-extrabold text-green-700 mb-3 tracking-tight">Payment Successful!</h1>
        <p className="mb-2 text-lg text-gray-700">Thank you, <span className="font-bold text-gray-900">{donorName}</span>, for your donation.</p>
        <div className="flex flex-col items-center gap-1 mb-4">
          <span className="text-base text-gray-700">Amount: <span className="font-bold text-green-700">₹{amount}</span></span>
          <span className="text-base text-gray-700">Transaction ID: <span className="font-mono text-gray-900">{transactionId}</span></span>
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg shadow transition-all duration-150 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleDownloadReceipt}
        >
          Download Receipt
        </button>
        <Link href="/donate" className="mt-1">
          <span className="text-blue-600 hover:underline text-base">Make another donation</span>
        </Link>
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;
