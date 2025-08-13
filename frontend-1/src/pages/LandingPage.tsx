import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "For Students",
    points: [
      "Access all your courses in one place",
      "View videos, documents, and quizzes",
      "Track your lesson progress",
      "Take quizzes and see your score instantly",
    ],
  },
  {
    title: "For Admins",
    points: [
      "Create and manage courses easily",
      "Upload videos, PDFs, and text content",
      "Build modules, lessons, and quizzes",
      "Manage student enrollment and users",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between">
      <header className="w-full py-6 px-4 flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
            UniConnect-Learning Hub
          </h1>
          <p className="mt-2 text-base sm:text-lg md:text-2xl text-gray-200">
            Seamless and interactive e-learning platform for students and admins
          </p>
        </div>
        <Link
          to="/login"
          className="w-full sm:w-auto mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg shadow transition text-center"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("user");
          }}
        >
          Get Started
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 w-full">
        <section className="w-full max-w-5xl grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 mt-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-orange-500 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black">
                {feature.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white text-sm sm:text-base">
                {feature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section className="mt-12 sm:mt-16 max-w-3xl text-center px-2">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-orange-400">
            Why UniConnect-Learning Hub?
          </h3>
          <p className="text-gray-200 text-sm sm:text-base">
            Centralized, user-friendly online learning environment for students and robust management for admins. 
            Focused on simplicity, usability, and security. Accessible on any device.
          </p>
        </section>
      </main>
      <footer className="py-4 sm:py-6 text-center text-gray-500 text-xs sm:text-sm w-full px-2">
        &copy; {new Date().getFullYear()} UniConnect-Learning Hub. All rights reserved.
      </footer>
    </div>
  );
}
