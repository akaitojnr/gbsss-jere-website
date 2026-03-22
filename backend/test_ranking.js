
function calculateAverageRanks(students) {
    let studentScores = students.map((s, i) => {
        const total = s.scores.reduce((sum, score) => sum + score, 0);
        const average = s.scores.length > 0 ? total / s.scores.length : 0;
        return { name: s.name, total, average };
    });

    studentScores.sort((a, b) => b.average - a.average);

    let currentRank = 1;
    let results = [];
    for (let i = 0; i < studentScores.length; i++) {
        if (i > 0 && studentScores[i].average < studentScores[i - 1].average) {
            currentRank = i + 1;
        }
        results.push({ name: studentScores[i].name, avg: studentScores[i].average.toFixed(2), rank: currentRank });
    }
    return results;
}

const testData = [
    { name: "Alice", scores: [90, 90, 90] }, // Avg 90
    { name: "Bob", scores: [80, 80, 80, 80] }, // Avg 80
    { name: "Charlie", scores: [85, 85] }      // Avg 85
];

console.log("Ranking Test (Average Based):");
console.table(calculateAverageRanks(testData));
