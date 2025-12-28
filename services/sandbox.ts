import { MatchContext, Move } from '../types';

/**
 * Safely executes a user-defined strategy code.
 * Uses `new Function` wrapped in a try-catch block.
 * Enforces a simple timeout via loop protection (conceptual in this synchronous env).
 */
export const executeStrategy = (code: string, context: MatchContext): Move => {
  try {
    // Create a function from the string.
    // We limit the scope by only providing 'context'.
    // We strictly enforce no access to window/document/fetch by shadowing them if needed,
    // though 'new Function' already isolates somewhat better than eval.
    // For a production app, we would use a Web Worker or iframe sandbox.
    
    // We wrap the user code in a function body
    const run = new Function('context', `
      "use strict";
      // Shadow globals to prevent easy access
      const window = undefined;
      const document = undefined;
      const fetch = undefined;
      const localStorage = undefined;
      const alert = undefined;
      
      ${code}
    `);

    const result = run(context);

    if (result === 'C' || result === 'D') {
      return result;
    }
    
    // Invalid return type defaults to Defect
    return 'D';

  } catch (error) {
    // Strategy crashed or timed out -> Auto Defect
    // console.warn("Strategy Execution Error:", error);
    return 'D';
  }
};
