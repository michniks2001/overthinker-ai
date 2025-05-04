"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

// Add CSS for animations
const styles = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
    100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .pulse-animation {
    animation: pulse 2s infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

export default function Home() {
    // Add the styles to the document
    useEffect(() => {
        // Add the style element if it doesn't exist
        if (!document.getElementById('custom-animations')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'custom-animations';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
            
            // Clean up on unmount
            return () => {
                const element = document.getElementById('custom-animations');
                if (element) element.remove();
            };
        }
    }, []);
    const [file, setFile] = useState(null);
    const [parsedText, setParsedText] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [studyData, setStudyData] = useState(null);
    const [isStudying, setIsStudying] = useState(false);
    const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);

    const router = useRouter();

    const handleFileChange = (files) => {
        if (files && files.length > 0) {
            const uploadedFile = files[0];
            setFile(uploadedFile);
            // Reset states when a new file is selected
            setParsedText(null);
            setFileName(null);
            setError(null);
            setStudyData(null);
            setIsDocumentUploaded(false);
        }
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

            // Read the response body once as JSON
            const data = await res.json();
            
            // Set the filename from the response
            if (data.fileName) {
                setFileName(data.fileName);
            }

            // Get the parsed text from the response data
            if (data.parsedText) {
                setParsedText(data.parsedText);
            }
            
            // Set document as successfully uploaded
            setIsDocumentUploaded(true);
            
            // Scroll to the document processed card
            setTimeout(() => {
                document.getElementById('document-processed-card')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setError(error.message || 'Failed to upload and parse PDF');
        } finally {
            setIsLoading(false);
        }
    };

    const startStudySession = () => {
        setIsStudying(true);
        
        // Navigate to the quiz page instead of calling the API directly
        // The quiz page will handle fetching the quiz data
        setTimeout(() => {
            // Add a small delay for better UX
            router.push('/quiz');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-purple-800 mb-2">OverThinkerAI</h1>
                    <p className="text-xl text-gray/-600">Your CS study buddy with wacky, unhinged explanations</p>
                </div>

                <Card className="mb-8 border-2 border-purple-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-purple-700">Upload Your Study Notes</CardTitle>
                        <CardDescription className="text-center">Upload your PDF documents and let OverThinkerAI create a study session with bizarre but effective explanations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <FileUpload onChange={handleFileChange} />
                        </div>
                        
                        {file && (
                            <div className="flex flex-col items-center mt-4">
                                <p className="mb-2 text-gray-600">
                                    Selected file: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
                                </p>
                                {!isDocumentUploaded ? (
                                    <Button 
                                        onClick={handleUpload} 
                                        disabled={isLoading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isLoading ? 'Processing...' : 'Upload & Process Document'}
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={startStudySession} 
                                        disabled={isStudying}
                                        className="bg-green-600 hover:bg-green-700 pulse-animation"
                                    >
                                        {isStudying ? 'Redirecting to Quiz...' : '🧠 Start Study Session'}
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {isDocumentUploaded && !isLoading && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <p className="text-green-800 font-medium">Document successfully uploaded!</p>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">You can now start your study session</p>
                                </div>
                        )}
                    </CardContent>
                    {error && (
                        <CardFooter>
                            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Ready to Study card removed as requested */}

                {studyData && studyData.quiz && (
                    <Card id="quiz-ready-card" className="mb-8 border-2 border-green-200 shadow-lg animate-fadeIn">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center text-green-700 flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                Your Study Session is Ready!
                            </CardTitle>
                            <CardDescription className="text-center">Time to dive into some wacky explanations and test your knowledge</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <p className="text-lg font-medium text-green-800">Quiz generated successfully!</p>
                                </div>
                                <p className="text-gray-600 mt-2">Your quiz has {studyData.quiz.questions?.length || 0} questions ready to challenge your understanding</p>
                            </div>
                            
                            {/* Display the first explanation as a preview */}
                            {studyData.quiz.questions && studyData.quiz.questions.find(q => q.type === "explanation") && (
                                <div className="mt-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                                    <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                                        <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        {studyData.quiz.questions.find(q => q.type === "explanation").title}
                                    </h3>
                                    <p className="text-gray-700 italic">
                                        {studyData.quiz.questions.find(q => q.type === "explanation").content.substring(0, 200)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col items-center">
                            <p className="text-center text-gray-600 mb-4">Ready to start your quiz with unhinged explanations?</p>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 pulse-animation" size="lg">
                                🚀 Start Quiz
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
