import React from 'react';
import { formatAIResponse } from './formatAIResponse';

// Test the enhanced mathematical formatting
const testMathContent = `
Let's solve question 1 step by step!
Question 1: Solve for x in the equation \` 32^((x - 3)) \\times 8^((x + 4)) = 64 \\div 2^x \`

Step 1: Express all numbers as powers of 2
( 32 = 2^5 )
( 8 = 2^3 )
( 64 = 2^6 )
So rewrite the equation:
\` (2^5)^(x-3) \\times (2^3)^(x + 4) = 2^6 \\div 2^x \`

Step 2: Apply the indices laws
( (a^m)^n = a^(mn) )
So:
\` 2^(5(x-3)) \\times 2^(3(x+4)) = 2^6 \\div 2^x \`

Step 3: Add the exponents on left side (since bases are the same)
\` 2^(5(x-3) + 3(x+4)) = 2^6 \\div 2^x \`
Expand:
( 5(x-3) = 5x - 15 )
( 3(x+4) = 3x + 12 )
So,
\` 2^(5x - 15 + 3x + 12) = 2^6 \\div 2^x \` \` 2^(8x - 3) = 2^(6 - x) \`
(Note: (2^6 \\div 2^x = 2^(6-x)))

Step 4: With the same bases, set the powers equal
\` 8x - 3 = 6 - x \`

Step 5: Solve for x
Add x to both sides:
\` 8x + x - 3 = 6 \` \` 9x - 3 = 6 \`
Add 3 to both sides:
\` 9x = 9 \`
Divide both sides by 9:
\` x = 1 \`

Final Answer:
\` \\boxed(x = 1) \`
(If you have any question about any step, or want another problem explained, just ask!)
`;

export const MathFormattingTest: React.FC = () => {
  const formattedContent = formatAIResponse(testMathContent, { theme: 'dark' });
  
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Enhanced Math Formatting Test</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        {formattedContent}
      </div>
    </div>
  );
};

export default MathFormattingTest;