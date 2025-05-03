"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
    const [file, setFile] = useState(null);
    const [parsedText, setParsedText] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
        <div className="max-w-2xl mx-auto p-6 text-black">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6">PDF Text Extractor</h1>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={handleFileChange} 
                            className="flex-1 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        />
                        <button 
                            onClick={handleUpload} 
                            disabled={isLoading || !file}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                isLoading || !file
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {isLoading ? 'Processing...' : 'Upload & Extract Text'}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {fileName && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <strong>File ID:</strong> {fileName}
                        </div>
                    )}

                    {parsedText && (
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Extracted Text:</h2>
                            <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-auto">
                                <pre className="whitespace-pre-wrap text-gray-800">{parsedText}</pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <textarea className="w-full p-4 mt-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" placeholder="What are you studying for?"></textarea>
                </div>

                <div className="space-y-4 mt-4">
                    <button className="w-full px-6 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50" onClick={() => router.push('/quiz')}>
                        Start Studying
                    </button>
                </div>
            </div>
        </div>
    );
}
