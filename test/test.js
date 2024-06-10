/* JavaScript example with vulnerabilities */

// Vulnerability 1: Using eval() is dangerous
function evaluateCode(code) {
    eval(code); // This is dangerous
}

// Vulnerability 2: Using document.write() is dangerous
function writeContent(content) {
    document.write(content); // This can lead to XSS vulnerabilities
}

// Vulnerability 3: Using innerHTML without proper sanitization is dangerous
function setInnerHTML(element, content) {
    element.innerHTML = content; // This can lead to XSS vulnerabilities
}

// Vulnerability 4: Using setTimeout with string arguments is dangerous
function executeTimeout(code) {
    setTimeout(code, 1000); // This is dangerous
}

// Vulnerability 5: Using setInterval with string arguments is dangerous
function executeInterval(code) {
    setInterval(code, 1000); // This is dangerous
}

// Example usage
evaluateCode("console.log('Executing code');");
writeContent("<h1>Hello World</h1>");
setInnerHTML(document.getElementById("myDiv"), "<p>Content</p>");
executeTimeout("console.log('Timeout code execution');");
executeInterval("console.log('Interval code execution');");
