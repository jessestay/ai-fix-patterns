const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load all patterns
const patternsDir = path.join(__dirname, '../patterns');
const patterns = {};

// Read existing patterns
fs.readdirSync(patternsDir)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
        const pattern = JSON.parse(fs.readFileSync(path.join(patternsDir, file)));
        const hash = crypto.createHash('sha256').update(pattern.pattern).digest('hex');
        patterns[hash] = pattern;
    });

// Update success rates based on history
Object.values(patterns).forEach(pattern => {
    if (pattern.history && pattern.history.length > 0) {
        const recent = pattern.history.slice(-100); // Last 100 uses
        pattern.success_rate = recent.filter(h => h.success).length / recent.length;
    }
});

// Write updated patterns
Object.entries(patterns).forEach(([hash, pattern]) => {
    fs.writeFileSync(
        path.join(patternsDir, `${hash}.json`),
        JSON.stringify(pattern, null, 2)
    );
}); 