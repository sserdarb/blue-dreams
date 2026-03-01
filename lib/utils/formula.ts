/**
 * Safely evaluates a mathematical formula containing variables.
 * @param expression The mathematical expression, e.g., "(revenue / rooms_sold) * 100"
 * @param variables A dictionary of variables to replace, e.g., { revenue: 5000, rooms_sold: 10 }
 * @returns The evaluated numerical result
 */
export function evaluateFormula(expression: string, variables: Record<string, number>): number {
    try {
        let safeExpression = expression.toLowerCase();

        // Allowed characters: lowercase letters (for variables), numbers, standard math operators, parens, and spaces
        if (!/^[a-z0-9()+\-*/.\s]+$/.test(safeExpression)) {
            console.warn("Invalid characters in formula");
            return NaN;
        }

        // Replace all known variables with their numeric values
        // Sort by length descending to prevent partial replacements (e.g. 'rev' vs 'revenue')
        const sortedKeys = Object.keys(variables).sort((a, b) => b.length - a.length);

        for (const key of sortedKeys) {
            // Use word boundary to replace exact variable names
            const regex = new RegExp(`\\b${key.toLowerCase()}\\b`, 'g');
            // Ensure negative numbers are wrapped in parens so they don't break consecutive operators
            const val = variables[key];
            const safeVal = val < 0 ? `(${val})` : val.toString();
            safeExpression = safeExpression.replace(regex, safeVal);
        }

        // If any alphabetic characters remain, it means there is an undefined variable or malicious code
        if (/[a-z]/i.test(safeExpression)) {
            console.warn("Formula contains undefined variables:", safeExpression);
            return NaN;
        }

        // Evaluate the sanitized math string
        // eslint-disable-next-line no-new-func
        const result = new Function(`return Number(${safeExpression})`)();

        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
            return 0; // Fallback to 0 for divide-by-zero or malformed returns
        }

        return result;
    } catch (e) {
        console.error("Formula evaluation failed:", e);
        return NaN;
    }
}
