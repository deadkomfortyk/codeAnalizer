CREATE TABLE vulnerabilities (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 language TEXT NOT NULL,
                                 pattern TEXT NOT NULL,
                                 description TEXT NOT NULL
);
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('javascript', 'eval(', 'Using eval() is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('javascript', 'document.write(', 'Using document.write() is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('javascript', 'innerHTML', 'Using innerHTML can lead to XSS vulnerabilities');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('javascript', 'setTimeout(', 'Using setTimeout with string arguments is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('javascript', 'setInterval(', 'Using setInterval with string arguments is dangerous');

INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'gets(', 'Using gets() is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'strcpy(', 'Use of strcpy() can cause buffer overflow');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'strcat(', 'Use of strcat() can cause buffer overflow');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'sprintf(', 'Use of sprintf() can cause buffer overflow');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'scanf(', 'Using scanf() without length limits can cause buffer overflow');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('c', 'system(', 'Using system() is dangerous as it can execute arbitrary commands');

INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'exec(', 'Using exec() is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'eval(', 'Using eval() is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'os.system(', 'Using os.system() is dangerous as it can execute arbitrary commands');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'subprocess.Popen(', 'Using subprocess.Popen with shell=True is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'pickle.load(', 'Using pickle.load() on untrusted data is dangerous');
INSERT INTO vulnerabilities (language, pattern, description) VALUES ('python', 'yaml.load(', 'Using yaml.load() on untrusted data is dangerous');

DELETE FROM vulnerabilities WHERE id NOT IN (
    SELECT MIN(id)
    FROM vulnerabilities
    GROUP BY language, pattern
);
