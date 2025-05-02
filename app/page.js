"use client"

import { useState } from 'react';

const UploadPDF = () => {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState(null);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error('Error uploading PDF:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload PDF</button>

            {response && (
                <div>
                    <h3>Response</h3>
                    <p><strong>Message:</strong> {response.message}</p>
                    <p><strong>Extracted Text:</strong></p>
                    <pre>{response.extractedText}</pre>
                </div>
            )}
        </div>
    );
};

export default UploadPDF;
