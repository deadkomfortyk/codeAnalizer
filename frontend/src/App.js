import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import Statistics from './components/Statistics';
import './style/App.css';

const App = () => {
    const [analysisResult, setAnalysisResult] = useState(null);

    return (
        <Router>
            <div className="App">
                <h1>Code Analyzer</h1>
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="buttons-container">
                                <FileUpload onFileUpload={setAnalysisResult} />
                                <Link to="/statistics"><button className="button">Переглянути статистику</button></Link>
                            </div>
                            <AnalysisResult result={analysisResult} />
                        </>
                    } />
                    <Route path="/statistics" element={
                        <>
                            <div className="buttons-container">
                                <Link to="/">
                                    <button className="button">Головна</button>
                                </Link>
                            </div>
                            <Statistics/>
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
