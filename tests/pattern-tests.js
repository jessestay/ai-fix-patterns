const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Pattern Tests', () => {
    const patternsDir = path.join(__dirname, '../patterns');
    const testDir = path.join(__dirname, 'fixtures');

    beforeAll(() => {
        // Create test fixtures directory
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }
    });

    afterAll(() => {
        // Clean up test fixtures
        fs.rmSync(testDir, { recursive: true });
    });

    // Test each pattern
    fs.readdirSync(patternsDir)
        .filter(file => file.endsWith('.json'))
        .forEach(file => {
            const pattern = JSON.parse(
                fs.readFileSync(path.join(patternsDir, file))
            );

            test(`Pattern: ${pattern.pattern}`, () => {
                // Create test file
                const testFile = path.join(testDir, `test-${file}.txt`);
                fs.writeFileSync(testFile, createTestCase(pattern));

                // Apply fix
                const fixCommand = pattern.fix.replace('$FILE', testFile);
                execSync(fixCommand);

                // Verify fix
                const result = verifyFix(testFile, pattern);
                expect(result.success).toBe(true);
            });
        });
});

function createTestCase(pattern) {
    switch (pattern.context.language) {
        case 'php':
            return createPhpTestCase(pattern);
        case 'javascript':
            return createJsTestCase(pattern);
        default:
            return '';
    }
}

function verifyFix(file, pattern) {
    const content = fs.readFileSync(file, 'utf8');
    switch (pattern.context.type) {
        case 'syntax':
            return verifySyntax(content, pattern);
        case 'dependency':
            return verifyDependency(content, pattern);
        default:
            return { success: false, message: 'Unknown pattern type' };
    }
} 