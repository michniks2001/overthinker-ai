"use client"

import { useState } from 'react';

export default function Home() {
    const [file, setFile] = useState(null);
    const [parsedText, setParsedText] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        // Reset states when a new file is selected
        setParsedText(null);
        setFileName(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a PDF file first");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }

            // Get the filename from the header
            const fileNameHeader = res.headers.get('FileName');
            if (fileNameHeader) {
                setFileName(fileNameHeader);
            }

            // Get the parsed text from the response body
            const text = await res.text();
            setParsedText(text);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setError(error.message || 'Failed to upload and parse PDF');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">PDF Text Extractor</h1>
            
            <div className="mb-4">
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="mb-2 p-2 border rounded"
                />
                <button 
                    onClick={handleUpload} 
                    disabled={isLoading || !file}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {isLoading ? 'Processing...' : 'Upload & Extract Text'}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {fileName && (
                <div className="mb-2">
                    <strong>File ID:</strong> {fileName}
                </div>
            )}

            {parsedText && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
                    <div className="p-4 bg-gray-100 rounded max-h-96 overflow-auto">
                        <pre className="whitespace-pre-wrap">{parsedText}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
