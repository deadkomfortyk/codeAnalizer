const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { analyzeCode } = require('./analyzeCode');
const { generatePDF } = require('./generatePDF');

const app = express();
const port = 3001;

const db = new sqlite3.Database(path.join(__dirname, '../database/data/vulnerabilities.db'), (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('codefile'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    console.log(`File content: ${fileContent}`);

    let detectedLanguage;
    if (req.file.originalname.endsWith('.js')) {
        detectedLanguage = 'javascript';
    } else if (req.file.originalname.endsWith('.c')) {
        detectedLanguage = 'c';
    } else if (req.file.originalname.endsWith('.py')) {
        detectedLanguage = 'python';
    } else {
        detectedLanguage = 'unknown';
    }

    console.log(`Detected language based on file extension: ${detectedLanguage}`);

    if (detectedLanguage === 'unknown') {
        res.status(400).json({ message: 'Unsupported file type' });
        return;
    }

    try {
        const dbVulnerabilities = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM vulnerabilities WHERE language = ?', [detectedLanguage], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        console.log(`Loaded vulnerability patterns from database: ${JSON.stringify(dbVulnerabilities)}`);

        const issues = analyzeCode(detectedLanguage, fileContent, dbVulnerabilities);

        console.log(`Detected issues: ${JSON.stringify(issues)}`);

        // Save analysis statistics
        const vulnerabilitiesDetected = issues.length;
        db.run(
            'INSERT INTO analysis_statistics (file_name, language, vulnerabilities_detected) VALUES (?, ?, ?)',
            [req.file.originalname, detectedLanguage, vulnerabilitiesDetected],
            (err) => {
                if (err) {
                    console.error('Error saving analysis statistics', err);
                } else {
                    console.log('Analysis statistics saved');
                }
            }
        );

        res.json({ message: 'File uploaded and analyzed', fileContent, language: detectedLanguage, issues });
    } catch (error) {
        console.error('Error analyzing code', error);
        res.status(500).json({ message: 'Error analyzing code', error: error.message });
    } finally {
        fs.unlinkSync(filePath); // Delete the uploaded file after processing
    }
});

app.post('/generate-pdf', async (req, res) => {
    const analysisResult = req.body.result;
    const outputPath = path.join(__dirname, 'analysis_result.pdf');

    try {
        await generatePDF(analysisResult, outputPath);
        res.download(outputPath, 'analysis_result.pdf', (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                res.status(500).json({ message: 'Error generating PDF', error: err.message });
            } else {
                fs.unlinkSync(outputPath); // Delete the PDF after sending it
            }
        });
    } catch (error) {
        console.error('Error generating PDF', error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});

app.get('/statistics', (req, res) => {
    db.all('SELECT * FROM analysis_statistics', (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Error fetching statistics', error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.delete('/statistics/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM analysis_statistics WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ message: 'Error deleting record', error: err.message });
        } else {
            // Перебудувати таблицю після видалення запису
            db.serialize(() => {
                db.run('CREATE TEMPORARY TABLE temp_table AS SELECT * FROM analysis_statistics', (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Error creating temporary table', error: err.message });
                        return;
                    }
                    db.run('DROP TABLE analysis_statistics', (err) => {
                        if (err) {
                            res.status(500).json({ message: 'Error dropping original table', error: err.message });
                            return;
                        }
                        db.run('CREATE TABLE analysis_statistics (id INTEGER PRIMARY KEY AUTOINCREMENT, file_name TEXT, language TEXT, vulnerabilities_detected INTEGER, analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP)', (err) => {
                            if (err) {
                                res.status(500).json({ message: 'Error creating new table', error: err.message });
                                return;
                            }
                            db.run('INSERT INTO analysis_statistics (file_name, language, vulnerabilities_detected, analysis_date) SELECT file_name, language, vulnerabilities_detected, analysis_date FROM temp_table', (err) => {
                                if (err) {
                                    res.status(500).json({ message: 'Error transferring data to new table', error: err.message });
                                } else {
                                    db.run('DROP TABLE temp_table', (err) => {
                                        if (err) {
                                            res.status(500).json({ message: 'Error dropping temporary table', error: err.message });
                                        } else {
                                            res.json({ message: 'Record deleted and table rebuilt', id });
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }
    });
});

app.delete('/statistics', (req, res) => {
    db.run('DELETE FROM analysis_statistics', (err) => {
        if (err) {
            res.status(500).json({ message: 'Error clearing statistics', error: err.message });
        } else {
            // Reset ID sequence after clearing table
            db.run('DELETE FROM sqlite_sequence WHERE name="analysis_statistics"', (err) => {
                if (err) {
                    res.status(500).json({ message: 'Error resetting ID sequence', error: err.message });
                } else {
                    res.json({ message: 'All statistics cleared and ID sequence reset' });
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
