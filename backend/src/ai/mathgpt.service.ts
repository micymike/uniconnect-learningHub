import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
/* Azure TTS: No Google TTS imports needed */

interface MathStep {
  step: number;
  description: string;
  equation: string;
  explanation: string;
}

interface MathSolution {
  problem: string;
  steps: MathStep[];
  finalAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

@Injectable()
export class MathGPTService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  // Solve math problem and generate step-by-step solution
  async solveMathProblem(
    userId: string,
    problem: string,
    image?: Express.Multer.File
  ): Promise<MathSolution> {
    let mathProblem = problem;

    // If image is provided, extract text from it first
    if (image && image.buffer) {
      try {
        const base64Image = image.buffer.toString('base64');
        const base = process.env.AZURE_API_BASE;
        const deployment = process.env.AZURE_API_MODEL;
        const apiVersion = process.env.AZURE_API_VERSION;
        const apiKey = process.env.AZURE_API_KEY;

        if (base && deployment && apiVersion && apiKey) {
          const endpoint = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
          const payload = {
            model: deployment,
            messages: [
              { role: "system", content: "You are a math problem extractor. Extract the mathematical problem from the image and return only the problem text, nothing else." },
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract the math problem from this image:" },
                  { type: "image_url", image_url: { url: `data:${image.mimetype};base64,${base64Image}` } }
                ]
              }
            ],
            max_tokens: 200
          };
          const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
          };

          const response = await axios.post(endpoint, payload, { headers });
          const extractedProblem = response.data.choices?.[0]?.message?.content?.trim();
          if (extractedProblem) {
            mathProblem = extractedProblem;
          }
        }
      } catch (err) {
        console.error("Error extracting math problem from image:", err);
      }
    }

    // Generate step-by-step solution using free logic
    const solution = await this.generateMathSolution(mathProblem);
    
    // Store the solution in database for future reference
    try {
      await this.supabase
        .from('math_solutions')
        .insert({
          user_id: userId,
          problem: mathProblem,
          solution: JSON.stringify(solution),
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.error("Error storing math solution:", err);
    }

    return solution;
  }

  // Generate math solution using pattern matching and basic algebra
  private async generateMathSolution(problem: string): Promise<MathSolution> {
    const cleanProblem = problem.trim().toLowerCase();
    
    // Basic pattern matching for common math problems
    if (this.isLinearEquation(cleanProblem)) {
      return this.solveLinearEquation(problem);
    } else if (this.isQuadraticEquation(cleanProblem)) {
      return this.solveQuadraticEquation(problem);
    } else if (this.isArithmeticProblem(cleanProblem)) {
      return this.solveArithmetic(problem);
    } else if (this.isGeometryProblem(cleanProblem)) {
      return this.solveGeometry(problem);
    } else {
      // Fallback to AI if available, otherwise provide general guidance
      return this.provideMathGuidance(problem);
    }
  }

  private isLinearEquation(problem: string): boolean {
    return /\d*x\s*[+\-]\s*\d+\s*=\s*\d+/.test(problem) || 
           /solve.*for.*x/.test(problem) && problem.includes('=');
  }

  private isQuadraticEquation(problem: string): boolean {
    return /\d*x\^?2/.test(problem) || problem.includes('quadratic');
  }

  private isArithmeticProblem(problem: string): boolean {
    return /^\d+\s*[+\-*/]\s*\d+/.test(problem) || 
           /calculate|compute|find the (sum|difference|product|quotient)/.test(problem);
  }

  private isGeometryProblem(problem: string): boolean {
    return /(area|perimeter|volume|circumference|radius|diameter|triangle|circle|rectangle|square)/.test(problem);
  }

  private solveLinearEquation(problem: string): MathSolution {
    // Extract coefficients using regex
    const match = problem.match(/(\d*)x\s*([+\-])\s*(\d+)\s*=\s*(\d+)/);
    if (!match) {
      return this.provideMathGuidance(problem);
    }

    const a = parseInt(match[1] || '1');
    const operator = match[2];
    const b = parseInt(match[3]);
    const c = parseInt(match[4]);

    const actualB = operator === '+' ? b : -b;
    const x = (c - actualB) / a;

    return {
      problem,
      steps: [
        {
          step: 1,
          description: "Identify the linear equation",
          equation: `${a}x ${operator} ${b} = ${c}`,
          explanation: "We have a linear equation in the form ax + b = c"
        },
        {
          step: 2,
          description: "Isolate the variable term",
          equation: `${a}x = ${c} ${operator === '+' ? '-' : '+'} ${b}`,
          explanation: `Subtract ${actualB} from both sides`
        },
        {
          step: 3,
          description: "Solve for x",
          equation: `x = ${c - actualB}/${a}`,
          explanation: `Divide both sides by ${a}`
        },
        {
          step: 4,
          description: "Simplify",
          equation: `x = ${x}`,
          explanation: "This is our final answer"
        }
      ],
      finalAnswer: `x = ${x}`,
      difficulty: 'easy',
      topic: 'Linear Equations'
    };
  }

  private solveQuadraticEquation(problem: string): MathSolution {
    // Basic quadratic solver - this is a simplified version
    return {
      problem,
      steps: [
        {
          step: 1,
          description: "Identify the quadratic equation",
          equation: "ax² + bx + c = 0",
          explanation: "Standard form of a quadratic equation"
        },
        {
          step: 2,
          description: "Apply the quadratic formula",
          equation: "x = (-b ± √(b² - 4ac)) / 2a",
          explanation: "The quadratic formula gives us the solutions"
        },
        {
          step: 3,
          description: "Calculate the discriminant",
          equation: "Δ = b² - 4ac",
          explanation: "The discriminant tells us about the nature of roots"
        },
        {
          step: 4,
          description: "Find the solutions",
          equation: "x₁, x₂ = ...",
          explanation: "Substitute values into the formula"
        }
      ],
      finalAnswer: "Solutions depend on specific coefficients",
      difficulty: 'medium',
      topic: 'Quadratic Equations'
    };
  }

  private solveArithmetic(problem: string): MathSolution {
    // Extract numbers and operation
    const match = problem.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (!match) {
      return this.provideMathGuidance(problem);
    }

    const num1 = parseInt(match[1]);
    const operator = match[2];
    const num2 = parseInt(match[3]);
    
    let result: number;
    let operationName: string;
    
    switch (operator) {
      case '+':
        result = num1 + num2;
        operationName = 'addition';
        break;
      case '-':
        result = num1 - num2;
        operationName = 'subtraction';
        break;
      case '*':
        result = num1 * num2;
        operationName = 'multiplication';
        break;
      case '/':
        result = num1 / num2;
        operationName = 'division';
        break;
      default:
        return this.provideMathGuidance(problem);
    }

    return {
      problem,
      steps: [
        {
          step: 1,
          description: `Identify the ${operationName} problem`,
          equation: `${num1} ${operator} ${num2}`,
          explanation: `We need to ${operationName === 'addition' ? 'add' : operationName === 'subtraction' ? 'subtract' : operationName === 'multiplication' ? 'multiply' : 'divide'} these numbers`
        },
        {
          step: 2,
          description: `Perform the ${operationName}`,
          equation: `${num1} ${operator} ${num2} = ${result}`,
          explanation: `${operationName === 'addition' ? `${num1} plus ${num2} equals ${result}` : 
                        operationName === 'subtraction' ? `${num1} minus ${num2} equals ${result}` :
                        operationName === 'multiplication' ? `${num1} times ${num2} equals ${result}` :
                        `${num1} divided by ${num2} equals ${result}`}`
        }
      ],
      finalAnswer: `${result}`,
      difficulty: 'easy',
      topic: 'Arithmetic'
    };
  }

  private solveGeometry(problem: string): MathSolution {
    // Basic geometry problem solver
    if (problem.includes('area') && problem.includes('rectangle')) {
      return {
        problem,
        steps: [
          {
            step: 1,
            description: "Identify the shape",
            equation: "Rectangle",
            explanation: "We need to find the area of a rectangle"
          },
          {
            step: 2,
            description: "Recall the formula",
            equation: "Area = length × width",
            explanation: "The area of a rectangle is length times width"
          },
          {
            step: 3,
            description: "Substitute values",
            equation: "Area = l × w",
            explanation: "Replace with the given measurements"
          }
        ],
        finalAnswer: "Area = l × w square units",
        difficulty: 'easy',
        topic: 'Geometry - Area'
      };
    }

    return this.provideMathGuidance(problem);
  }

  private provideMathGuidance(problem: string): MathSolution {
    return {
      problem,
      steps: [
        {
          step: 1,
          description: "Analyze the problem",
          equation: problem,
          explanation: "Let's break down what we're asked to find"
        },
        {
          step: 2,
          description: "Identify the mathematical concept",
          equation: "Determine the topic area",
          explanation: "What type of math problem is this? (Algebra, Geometry, Calculus, etc.)"
        },
        {
          step: 3,
          description: "Apply relevant formulas or methods",
          equation: "Use appropriate mathematical tools",
          explanation: "Choose the right approach based on the problem type"
        },
        {
          step: 4,
          description: "Work through step by step",
          equation: "Show all work clearly",
          explanation: "Break the solution into manageable steps"
        }
      ],
      finalAnswer: "Solution depends on specific problem details",
      difficulty: 'medium',
      topic: 'General Mathematics'
    };
  }

  // Generate video script for the solution
  async generateVideoScript(solution: MathSolution): Promise<{
    script: string;
    animations: any[];
    duration: number;
    audioPath?: string;
  }> {
    const script = this.createNarrationScript(solution);
    const animations = this.createAnimationSequence(solution);
    const duration = this.estimateDuration(solution);

    // Generate narration audio with fallback handling
    const audioPath = await this.generateNarrationAudio(script);

    return {
      script,
      animations,
      duration,
      audioPath
    };
  }

  /**
   * Generate narration audio from script using Google Cloud Text-to-Speech.
   * Returns the path to the generated audio file (MP3).
   */
  /**
   * Generate narration audio using free TTS services.
   */
  private async generateNarrationAudio(script: string): Promise<string | undefined> {
    try {
      const response = await axios.post('https://api.streamelements.com/kappa/v2/speech', 
        { voice: 'Brian', text: script },
        { responseType: 'arraybuffer', timeout: 15000 }
      );
      
      const outDir = path.join(__dirname, '../../../tmp');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      
      const filePath = path.join(outDir, `narration_${Date.now()}.mp3`);
      fs.writeFileSync(filePath, Buffer.from(response.data));
      return filePath;
    } catch {
      return undefined;
    }
  }

  private createNarrationScript(solution: MathSolution): string {
    let script = `Hello! Let's solve this ${solution.topic} problem step by step. `;
    script += `The problem is: ${solution.problem}. `;
    
    solution.steps.forEach((step, index) => {
      script += `Step ${step.step}: ${step.description}. `;
      script += `${step.explanation}. `;
      if (step.equation !== solution.problem) {
        script += `We write: ${step.equation}. `;
      }
    });
    
    script += `Therefore, our final answer is: ${solution.finalAnswer}. `;
    script += `Great job working through this problem!`;
    
    return script;
  }

  private createAnimationSequence(solution: MathSolution): any[] {
    return solution.steps.map((step, index) => ({
      type: 'equation',
      content: step.equation,
      duration: 3000,
      highlight: true,
      explanation: step.explanation,
      step: step.step
    }));
  }

  private estimateDuration(solution: MathSolution): number {
    // Estimate 5 seconds per step + 10 seconds intro/outro
    return (solution.steps.length * 5 + 10) * 1000;
  }
}
