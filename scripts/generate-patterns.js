const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generatePatterns(logFile) {
    const errorPatterns = extractErrorPatterns(logFile);
    const successfulFixes = extractSuccessfulFixes(logFile);
    
    // Match errors with their fixes
    const patterns = correlateErrorsAndFixes(errorPatterns, successfulFixes);
    
    // Save new patterns
    saveNewPatterns(patterns);
}

function extractErrorPatterns(logFile) {
    const content = fs.readFileSync(logFile, 'utf8');
    const errors = [];
    
    // Extract error messages and context
    const errorRegex = /ERROR:\s*(.*?)(?=ERROR:|WARNING:|$)/gs;
    let match;
    
    while ((match = errorRegex.exec(content)) !== null) {
        const error = match[1].trim();
        const context = determineContext(error);
        errors.push({ error, context });
    }
    
    return errors;
}

function determineContext(error) {
    const contexts = {
        php: /PHP|PHPCS|WordPress|Yoda/i,
        javascript: /JS|JavaScript|ESLint|webpack/i,
        css: /CSS|SCSS|stylelint/i
    };
    
    for (const [lang, regex] of Object.entries(contexts)) {
        if (regex.test(error)) {
            return {
                language: lang,
                type: determineErrorType(error),
                tool: determineToolType(error)
            };
        }
    }
    
    return { language: 'unknown', type: 'unknown', tool: 'unknown' };
}

function determineErrorType(error) {
    const types = {
        syntax: /(syntax|parsing|unexpected|invalid)/i,
        dependency: /(missing|not found|require|import)/i,
        style: /(style|format|indent|spacing)/i
    };
    
    for (const [type, regex] of Object.entries(types)) {
        if (regex.test(error)) return type;
    }
    
    return 'unknown';
}

function saveNewPatterns(patterns) {
    patterns.forEach(pattern => {
        const hash = crypto
            .createHash('sha256')
            .update(pattern.pattern)
            .digest('hex');
            
        const filePath = path.join(
            __dirname,
            '../patterns',
            `${hash}.json`
        );
        
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(
                filePath,
                JSON.stringify(pattern, null, 2)
            );
            console.log(`New pattern saved: ${pattern.pattern}`);
        }
    });
}

// Run if called directly
if (require.main === module) {
    const logFile = process.argv[2];
    if (!logFile) {
        console.error('Please provide a log file path');
        process.exit(1);
    }
    generatePatterns(logFile);
} 