import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">This Privacy Policy applies to donations made to Islamic Dawa Academy run by Akode Islamic Centre. We respect your privacy and are committed to protecting your personal information.</p>
      <ul className="list-disc pl-5 mb-4">
        <li>We collect your name, email, phone number, and donation amount for processing and record-keeping.</li>
        <li>Your information will not be shared with third parties except as required by law or payment processing (Razorpay).</li>
        <li>We use industry-standard security measures to protect your data.</li>
        <li>For any privacy-related queries, contact us at <a href="mailto:islamiccentre.akod@gmail.com" className="text-blue-700 underline">islamiccentre.akod@gmail.com</a> or +91 97458 33399.</li>
      </ul>
      <p>By donating, you consent to this privacy policy.</p>
    </main>
  );
}
