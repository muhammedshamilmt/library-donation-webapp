import React from "react";

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
      <p className="mb-4">These terms and conditions govern donations made to Islamic Dawa Academy run by Akode Islamic Centre.</p>
      <ul className="list-disc pl-5 mb-4">
        <li>All donations are voluntary and non-refundable except in cases of genuine mistakes (see Return Policy).</li>
        <li>Donations are used for educational and charitable purposes as described on our website.</li>
        <li>By donating, you agree to provide accurate information and not to use fraudulent payment methods.</li>
        <li>For queries, contact <a href="mailto:islamiccentre.akod@gmail.com" className="text-blue-700 underline">islamiccentre.akod@gmail.com</a> or +91 97458 33399.</li>
      </ul>
      <p>Islamic Dawa Academy reserves the right to update these terms at any time.</p>
    </main>
  );
}
