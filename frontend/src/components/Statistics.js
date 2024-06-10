import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../style/Statistics.css';

const Statistics = () => {
    const [statistics, setStatistics] = useState([]);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:3001/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/statistics/${id}`);
            fetchStatistics();
        } catch (error) {
            console.error('Error deleting statistic:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await axios.delete('http://localhost:3001/statistics');
            fetchStatistics();
        } catch (error) {
            console.error('Error clearing statistics:', error);
        }
    };

    return (
        <div className="statistics-container">
            <h2>Статистика Аналізу</h2>
            <div className="buttons-container-statistics">
                <button className="clear-button" onClick={handleClearAll}>Очистити все</button>
            </div>

            <table className="statistics-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Назва файлу</th>
                    <th>Мова</th>
                    <th>Виявлені уразливості</th>
                    <th>Дата аналізу</th>
                    <th>Дія</th>
                </tr>
                </thead>
                <tbody>
                {statistics.map((stat) => (
                    <tr key={stat.id}>
                        <td>{stat.id}</td>
                        <td>{stat.file_name}</td>
                        <td>{stat.language}</td>
                        <td>{stat.vulnerabilities_detected}</td>
                        <td>{stat.analysis_date}</td>
                        <td>
                            <button onClick={() => handleDelete(stat.id)}>Видалити</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Link to="/">
                <button className="back-button">Назад</button>
            </Link>
        </div>
    );
};

export default Statistics;
