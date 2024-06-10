const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../database/data/vulnerabilities.db'));

function analyzeJavaScript(code, vulnerabilities) {
    const issues = [];
    const lines = code.split('\n');
    vulnerabilities.forEach(vulnerability => {
        lines.forEach((line, index) => {
            if (line.includes(vulnerability.pattern) && !line.trim().startsWith('//')) {
                issues.push({
                    line: index + 1,
                    issue: vulnerability.description
                });
            }
        });
    });
    return issues;
}

function analyzeC(code, vulnerabilities) {
    const issues = [];
    const lines = code.split('\n');
    vulnerabilities.forEach(vulnerability => {
        lines.forEach((line, index) => {
            if (line.includes(vulnerability.pattern) && !line.trim().startsWith('//')) {
                issues.push({
                    line: index + 1,
                    issue: vulnerability.description
                });
            }
        });
    });
    return issues;
}

function analyzePython(code, vulnerabilities) {
    const issues = [];
    const lines = code.split('\n');
    vulnerabilities.forEach(vulnerability => {
        lines.forEach((line, index) => {
            if (line.includes(vulnerability.pattern) && !line.trim().startsWith('#')) {
                issues.push({
                    line: index + 1,
                    issue: vulnerability.description
                });
            }
        });
    });
    return issues;
}

function analyzeCode(language, code, vulnerabilities) {
    const uniqueVulnerabilities = Array.from(new Set(vulnerabilities.map(v => JSON.stringify(v)))).map(v => JSON.parse(v));
    switch (language) {
        case 'javascript':
            return analyzeJavaScript(code, uniqueVulnerabilities);
        case 'c':
            return analyzeC(code, uniqueVulnerabilities);
        case 'python':
            return analyzePython(code, uniqueVulnerabilities);
        default:
            return [];
    }
}

module.exports = { analyzeCode };
