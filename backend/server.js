const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const { analyzeCode } = require('./analyzeCode');
const { generatePDF } = require('./generatePDF');

const app = express();
const port = 3001;

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres', // Змініть на свого користувача
    host: 'localhost',
    database: 'codeanalizer', // Назва вашої бази даних
    password: 'servicemil', // Пароль користувача
    port: 5432, // Стандартний порт PostgreSQL
});

// Перевірка з'єднання з базою даних
pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database');
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
        const dbVulnerabilities = await pool.query(
            'SELECT * FROM vulnerabilities WHERE language = $1',
            [detectedLanguage]
        );

        console.log(`Loaded vulnerability patterns from database: ${JSON.stringify(dbVulnerabilities.rows)}`);

        const issues = analyzeCode(detectedLanguage, fileContent, dbVulnerabilities.rows);

        console.log(`Detected issues: ${JSON.stringify(issues)}`);

        // Save analysis statistics
        const vulnerabilitiesDetected = issues.length;
        await pool.query(
            'INSERT INTO analysis_statistics (file_name, language, vulnerabilities_detected) VALUES ($1, $2, $3)',
            [req.file.originalname, detectedLanguage, vulnerabilitiesDetected]
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

app.get('/statistics', async (req, res) => {
    try {
        const stats = await pool.query('SELECT * FROM analysis_statistics');
        res.json(stats.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

app.delete('/statistics/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('DELETE FROM analysis_statistics WHERE id = $1', [id]);
        res.json({ message: 'Record deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
});

app.delete('/statistics', async (req, res) => {
    try {
        await pool.query('DELETE FROM analysis_statistics');
        res.json({ message: 'All statistics cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing statistics', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
