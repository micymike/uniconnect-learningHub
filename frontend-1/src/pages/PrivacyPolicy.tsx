import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-gray-900 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Privacy Policy</h1>
      <p className="mb-4">
        This Privacy Policy describes how UniConnect ("we", "us", or "our") collects, uses, and protects your personal information when you use our services.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Personal information you provide (such as name, email address, etc.)</li>
        <li>Usage data and analytics</li>
        <li>Information from third-party sign-in (e.g., Google OAuth)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and improve our services</li>
        <li>To communicate with you</li>
        <li>To comply with legal obligations</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Protection</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
      <p className="mb-4">
        Our service may integrate with third-party providers (such as Google). Their privacy policies apply to data shared with them.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You may request access, correction, or deletion of your personal data.</li>
        <li>Contact us for any privacy-related concerns.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Changes will be posted on this page.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at support@uniconnect.com.
      </p>
    </div>
  );
}
