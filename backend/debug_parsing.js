const XLSX = require('xlsx');

// Mock parsing logic (copy of current server.js logic)
function parseRow(row, index) {
    const questions = [];

    // Flexible column matching
    const questionText = row['Question'] || row['question'] || '';

    // Find the "Correct Answer" column dynamically
    const rowKeys = Object.keys(row);
    const correctKey = rowKeys.find(k => {
        const lower = k.toLowerCase();
        return lower.includes('correct') || lower === 'answer' || lower === 'ans';
    });

    const correctValue = (correctKey ? row[correctKey] : '').toString().trim();

    if (correctKey) {
        console.log(`Row ${index}: Found Key="${correctKey}", Value="${correctValue}"`);
    } else {
        console.log(`Row ${index}: NO CORRECT KEY FOUND. Keys: ${rowKeys.join(', ')}`);
    }

    const correctCharUpper = correctValue.toUpperCase();
    let correctIndex = -1;

    // 1. Exact A-D
    if (['A', 'B', 'C', 'D'].includes(correctCharUpper)) {
        correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper);
        console.log(`  -> Match Exact: ${correctIndex}`);
    }
    // 2. "Option A", "Option B" (Case insensitive)
    else if (correctCharUpper.startsWith("OPTION ") && ["A", "B", "C", "D"].includes(correctCharUpper.split(" ")[1])) {
        correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper.split(" ")[1]);
        console.log(`  -> Match Option Prefix: ${correctIndex}`);
    }
    // 3. "A.", "B)", "A " (Case insensitive)
    else if (/^[A-D][.)]?$/.test(correctCharUpper)) {
        correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper.charAt(0));
        console.log(`  -> Match Punctuation: ${correctIndex}`);
    }
    // 4. Numeric 1-4
    else if (!isNaN(parseInt(correctValue))) {
        const val = parseInt(correctValue);
        if (val >= 1 && val <= 4) {
            correctIndex = val - 1;
            console.log(`  -> Match Numeric: ${correctIndex}`);
        }
    }

    const options = [
        (row['Option A'] || row['option a'] || '').toString().trim(),
        (row['Option B'] || row['option b'] || '').toString().trim(),
        (row['Option C'] || row['option c'] || '').toString().trim(),
        (row['Option D'] || row['option d'] || '').toString().trim()
    ];

    // Match by text (case-insensitive)
    if (correctIndex === -1 && correctValue !== '') {
        const lowerCorrect = correctValue.toLowerCase();
        const foundIndex = options.findIndex(opt => opt.toLowerCase() === lowerCorrect);
        if (foundIndex !== -1) {
            correctIndex = foundIndex;
            console.log(`  -> Match Text: ${correctIndex}`);
        }
    }

    if (correctIndex < 0 || correctIndex > 3) {
        console.warn(`  -> FAILED. Defaulting to 0.`);
        correctIndex = 0;
    }

    return correctIndex;
}

// Test Data
const testCases = [
    { "Correction Option": "A" },          // Verify "Correction Option" header (User mentioned "correction option")
    { "Correct Answer": "Answer is B" },   // Verbose
    { "Correct": "c" },                    // Lowercase
    { "correct": "4" },                    // Numeric string
    { "Answer": "Option D" },              // "Answer" header?
    { "Correct Answer": "Apple", "Option A": "Apple", "Option B": "Banana" }, // Text Match
    { "Correct Answer": "B." },            // Dot
    { "Correct Answer": "C)" },            // Parenthesis
    { "Correct Answer": " D " },           // Whitespace
];

console.log("--- Starting Debug ---");
testCases.forEach((row, i) => {
    parseRow(row, i + 1);
});
