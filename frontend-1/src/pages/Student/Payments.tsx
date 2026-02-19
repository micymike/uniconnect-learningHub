import React from "react";

const Payments: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center relative">
      
      {/* Background Text */}
      <h1 className="absolute text-gray-700 text-[6rem] sm:text-[8rem] font-extrabold select-none opacity-10 text-center">
        Payments Feature Coming Soon
      </h1>

      {/* Centered Message */}
      <div className="z-10 text-center px-4">
        <p className="text-gray-400 text-lg sm:text-xl">
          The Payments module is not yet available. This feature will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default Payments;
