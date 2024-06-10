import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from '../style/AnalysisResult.module.css';

const AnalysisResult = ({ result }) => {
    const codeRef = useRef();

    useEffect(() => {
        if (codeRef.current && result) {
            hljs.highlightElement(codeRef.current);
        }
    }, [result]);

    if (!result) {
        return null;
    }

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Analysis Result', 14, 22);
        doc.setFontSize(12);
        doc.text('Code:', 14, 30);

        const splitCode = doc.splitTextToSize(result.fileContent, 180);
        const lineHeight = doc.getTextDimensions(splitCode[0]).h;

        splitCode.forEach((line, index) => {
            const y = 36 + (index * lineHeight);
            doc.text(`${index + 1}`.padStart(3, ' '), 10, y);
            doc.text(line, 20, y);
        });

        if (result.issues.length > 0) {
            doc.setFontSize(12);
            doc.text('Issues:', 14, 36 + splitCode.length * lineHeight + 10);
            result.issues.forEach((issue, index) => {
                doc.text(
                    `Line ${issue.line}: ${issue.issue}`,
                    14,
                    42 + splitCode.length * lineHeight + 10 + index * lineHeight
                );
            });
        } else {
            doc.setFontSize(12);
            doc.text('No found issues', 14, 36 + splitCode.length * lineHeight + 10);
        }

        doc.save('analysis_result.pdf');
    };

    return (
        <div className={styles.analysisResult}>
            <h2>Результат аналізу</h2>
            <pre className={styles.codeBlock}>
                <code ref={codeRef} className="hljs">
                    {result.rawContent}
                </code>
            </pre>
            <h3>Помилки:</h3>
            {result.issues.length > 0 ? (
                <ul className={styles.issuesList}>
                    {result.issues.map((issue, index) => (
                        <li key={index} className={styles.issueItem}>
                            Ряд {issue.line}: {issue.issue}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.noIssues}>Помилок не виявлено</p>
            )}
            <button className={styles.exportButton} onClick={handleExportPDF}>Експорт як PDF</button>
        </div>
    );
};

export default AnalysisResult;
