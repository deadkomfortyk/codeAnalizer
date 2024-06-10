import React, { useState } from 'react';
import axios from 'axios';
import '../style/FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
            setFileContent(event.target.result);
        };
        reader.readAsText(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('codefile', file);

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onFileUpload({ ...response.data, rawContent: fileContent });
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };

    return (
        <div className="file-upload">
            <label className="custom-file-upload">
                <input type="file" onChange={handleFileChange} />
                Вибрати файл
            </label>
            <button className="button" onClick={handleUpload}>Завантажити</button>
        </div>
    );
};

export default FileUpload;
