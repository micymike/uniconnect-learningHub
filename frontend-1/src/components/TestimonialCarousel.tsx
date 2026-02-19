import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Wanjiku Mwangi",
    message: "Uniconnect has transformed my study habits. I love the interactive features!",
  },
  {
    name: "Brian Otieno",
    message: "The app makes learning so much easier and fun. Highly recommended!",
  },
  {
    name: "Aisha Njeri",
    message: "I found amazing study partners and improved my grades. Asante sana!",
  },
  {
    name: "Samuel Kiptoo",
    message: "The quizzes and notes are top-notch. Best app for Kenyan students.",
  },
  {
    name: "Mercy Chebet",
    message: "I never thought online learning could be this engaging. Hongera Uniconnect!",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-2 py-8">
      <div className="w-full max-w-xs sm:max-w-sm bg-gray-900/80 rounded-2xl shadow-lg border border-gray-700 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg sm:text-xl font-semibold text-orange-300 mb-4">
              “{testimonials[index].message}”
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                {testimonials[index].name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="text-sm sm:text-base text-gray-200 font-medium">{testimonials[index].name}</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-orange-400" : "bg-gray-600"}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
