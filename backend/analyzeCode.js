const analyzeJavaScript = (code, vulnerabilities) => {
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
};

const analyzeC = (code, vulnerabilities) => {
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
};

const analyzePython = (code, vulnerabilities) => {
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
};

const analyzeCode = (language, code, vulnerabilities) => {
    // Уникальні вразливості для усунення дублювань
    const uniqueVulnerabilities = Array.from(
        new Set(vulnerabilities.map(v => JSON.stringify(v)))
    ).map(v => JSON.parse(v));

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
};

module.exports = { analyzeCode };
