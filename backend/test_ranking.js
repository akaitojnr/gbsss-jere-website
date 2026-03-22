
function calculateRanks(scores) {
    let studentScores = scores.map((s, i) => ({ id: i, totalScore: s }));
    studentScores.sort((a, b) => b.totalScore - a.totalScore);

    let currentRank = 1;
    let results = [];
    for (let i = 0; i < studentScores.length; i++) {
        if (i > 0 && studentScores[i].totalScore < studentScores[i - 1].totalScore) {
            currentRank = i + 1;
        }
        results.push({ score: studentScores[i].totalScore, rank: currentRank });
    }
    return results;
}

console.log("Test 1: (90, 90, 80)");
console.log(calculateRanks([90, 90, 80]));

console.log("\nTest 2: (100, 90, 90)");
console.log(calculateRanks([100, 90, 90]));

console.log("\nTest 3: (90, 80, 80, 70)");
console.log(calculateRanks([90, 80, 80, 70]));
