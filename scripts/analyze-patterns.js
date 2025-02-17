const fs = require('fs');
const path = require('path');

function analyzePatterns() {
    const patternsDir = path.join(__dirname, '../patterns');
    const patterns = {};
    let stats = {
        totalPatterns: 0,
        byLanguage: {},
        byType: {},
        byTool: {},
        successRates: [],
        mostUsed: []
    };

    // Load and analyze patterns
    fs.readdirSync(patternsDir)
        .filter(file => file.endsWith('.json'))
        .forEach(file => {
            const pattern = JSON.parse(
                fs.readFileSync(path.join(patternsDir, file))
            );
            stats.totalPatterns++;

            // Language stats
            const lang = pattern.context.language;
            stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;

            // Type stats
            const type = pattern.context.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Tool stats
            const tool = pattern.context.tool;
            stats.byTool[tool] = (stats.byTool[tool] || 0) + 1;

            // Success rate
            stats.successRates.push({
                pattern: pattern.pattern,
                rate: pattern.success_rate
            });

            // Usage stats if history exists
            if (pattern.history) {
                stats.mostUsed.push({
                    pattern: pattern.pattern,
                    uses: pattern.history.length
                });
            }
        });

    // Sort success rates and usage
    stats.successRates.sort((a, b) => b.rate - a.rate);
    stats.mostUsed.sort((a, b) => b.uses - a.uses);

    return stats;
}

// Generate report
const stats = analyzePatterns();
console.log('Pattern Analytics Report');
console.log('======================\n');
console.log(`Total Patterns: ${stats.totalPatterns}\n`);
console.log('By Language:', stats.byLanguage);
console.log('By Type:', stats.byType);
console.log('By Tool:', stats.byTool);
console.log('\nTop 5 Success Rates:');
stats.successRates.slice(0, 5).forEach(p => 
    console.log(`${p.pattern}: ${(p.rate * 100).toFixed(1)}%`)
);
console.log('\nMost Used Patterns:');
stats.mostUsed.slice(0, 5).forEach(p =>
    console.log(`${p.pattern}: ${p.uses} uses`)
); 