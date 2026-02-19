import React from 'react';
import { formatAIResponse } from './formatAIResponse';

// Test the fixed mathematical formatting with your problematic content
const testContent = `**Alright, let's break it down together, Mike! 🧮
You've got:**
$$1$
$$2. 3(x + yx + y) = 243
$$1$
x − y = 27 ÷ 3 = 9
$$1$
x + yx + y = 243 ÷ 3 = 81
$$1$
x − y = 9
$$1$
x + yx + y = 81
$$1$
(x − y) + (x + yx + y) = 9 + 81
$$1$
2x = 90
$$1$
x = 90 ÷ 2 = 45
$$1$
x + yx + y = 81
$$1$
45+y5+y = 81
$$1$
y = 81 − 45 = 36
$$1$
x = 45
$$1$
y = 36$$`;

export const FixedMathFormattingTest: React.FC = () => {
  const formattedContent = formatAIResponse(testContent, { theme: 'dark' });
  
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Fixed Math Formatting Test</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        {formattedContent}
      </div>
    </div>
  );
};

export default FixedMathFormattingTest;