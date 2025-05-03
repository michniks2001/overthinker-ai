"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
    const [file, setFile] = useState(null);
    const [parsedText, setParsedText] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [studyPrompt, setStudyPrompt] = useState('');

    const router = useRouter();

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
                const errorData = await res.json();
                throw new Error(errorData.message || `Error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            
            // Set the filename from the response
            if (data.fileName) {
                setFileName(data.fileName);
            }

            // Set the parsed text if available
            if (data.parsedText) {
                setParsedText(data.parsedText);
            }
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

            <div className="mb-4">
                <textarea
                    className="w-full p-4 mt-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    placeholder="What are you studying for?"
                    value={studyPrompt}
                    onChange={(e) => setStudyPrompt(e.target.value)}
                />
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
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
                    <div className="p-4 bg-gray-100 rounded max-h-96 overflow-auto">
                        <pre className="whitespace-pre-wrap">{parsedText}</pre>
                    </div>
                </div>
            )}

            {parsedText && (
                <div className="mt-4">
                    <button
                            onClick={async () => {
                            const res = await fetch(`/api/study-session?query=${studyPrompt}`);
                            const data = await res.json();
                            if (data.status === 200) {
                                try {
                                    // The quiz data is already in the correct format
                                    const studySessionData = data.quiz;
                                    // Navigate to quiz page with the data
                                    router.push(`/quiz?studyData=${encodeURIComponent(JSON.stringify(studySessionData))}`);
                                } catch (error) {
                                    console.error('Error parsing study data:', error);
                                    setError('Failed to parse study session data');
                                }
                            } else {
                                setError(data.error || 'Failed to generate study session');
                            }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Start Study Session
                    </button>
                </div>
            )}
        </div>
    );
}
