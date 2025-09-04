import React from "react";

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Return & Refund Policy</h1>
      <p className="mb-4">Donations made to Islamic Dawa Academy run by Akode Islamic Centre are generally non-refundable.</p>
      <ul className="list-disc pl-5 mb-4">
        <li>Refunds will only be provided if you donated by mistake (e.g., intended to donate ₹10 but donated ₹100).</li>
        <li>To request a refund, contact us immediately at <a href="mailto:islamiccentre.akod@gmail.com" className="text-blue-700 underline">islamiccentre.akod@gmail.com</a> or +91 97458 33399 with your payment details.</li>
        <li>Refund requests must be made within 24 hours of the donation.</li>
        <li>Approved refunds will be processed to the original payment method.</li>
      </ul>
      <p>For any queries, please contact us.</p>
    </main>
  );
}
