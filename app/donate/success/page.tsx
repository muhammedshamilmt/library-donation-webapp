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
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="mb-2">Thank you, <span className="font-semibold">{donorName}</span>, for your donation.</p>
        <p className="mb-2">Amount: <span className="font-semibold">₹{amount}</span></p>
        <p className="mb-4">Transaction ID: <span className="font-mono">{transactionId}</span></p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          onClick={handleDownloadReceipt}
        >
          Download Receipt
        </button>
        <Link href="/donate">
          <span className="text-blue-600 hover:underline">Make another donation</span>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
