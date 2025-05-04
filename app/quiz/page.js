"use client"

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Add CSS for animations - matching the main page style
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
  
  .quiz-option-selected {
    border-color: rgb(147, 51, 234) !important;
    background-color: rgba(147, 51, 234, 0.1) !important;
  }
  
  .quiz-option:hover {
    border-color: rgb(147, 51, 234, 0.5);
    background-color: rgba(147, 51, 234, 0.05);
  }
`;

const QuizPage = () => {
    const router = useRouter();
    
    // Add the styles to the document
    useEffect(() => {
        // Add the style element if it doesn't exist
        if (!document.getElementById('quiz-animations')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'quiz-animations';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
            
            // Clean up on unmount
            return () => {
                const element = document.getElementById('quiz-animations');
                if (element) element.remove();
            };
        }
    }, []);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [codeAnswer, setCodeAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [freeResponseAnswer, setFreeResponseAnswer] = useState('');
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Use a ref to track if the API call has been made
    const apiCallMadeRef = useRef(false);

    useEffect(() => {
        // Create a controller for this effect instance
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Use a flag to track if we've already started fetching
        let isFetching = false;
        
        // Function to fetch quiz data
        const fetchQuizData = async () => {
            // Prevent duplicate fetches within the same effect instance
            if (isFetching || apiCallMadeRef.current) {
                return;
            }
            
            // Mark that we're fetching
            isFetching = true;
            
            setIsLoading(true);
            setError(null);
            
            try {
                // Check if the request has been aborted
                if (signal.aborted) return;
                
                // First check if data was passed via URL params
                const studyData = searchParams.get('studyData');
                if (studyData) {
                    try {
                        const parsedData = JSON.parse(studyData);
                        // The questions are nested under the 'questions' key
                        if (!signal.aborted) {
                            setQuestions(parsedData.questions || []);
                            setIsLoading(false);
                            apiCallMadeRef.current = true;
                        }
                        return; // Exit early if we have data from URL
                    } catch (error) {
                        if (!signal.aborted) {
                            console.error('Error parsing study data from URL:', error);
                        }
                        // Continue to API fetch if URL parsing fails
                    }
                }
                
                // If no data in URL or parsing failed, fetch from API
                if (!signal.aborted) {
                    console.log('Fetching quiz data from API...');
                }
                
                const query = searchParams.get('query') || '';
                const apiUrl = query ? `/api/study-session?query=${encodeURIComponent(query)}` : '/api/study-session';
                
                // Use the abort signal with fetch
                const response = await fetch(apiUrl, { signal });
                
                // Check if aborted after fetch
                if (signal.aborted) return;
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Check if aborted after parsing JSON
                if (signal.aborted) return;
                
                console.log('Quiz data received:', data);
                
                if (data.quiz && data.quiz.questions) {
                    setQuestions(data.quiz.questions);
                    // Mark that we've successfully made an API call
                    apiCallMadeRef.current = true;
                } else {
                    throw new Error('No quiz questions found in the response');
                }
            } catch (error) {
                // Only handle errors if not aborted
                if (!signal.aborted) {
                    // Ignore abort errors
                    if (error.name !== 'AbortError') {
                        console.error('Error fetching quiz data:', error);
                        setError(error.message || 'Failed to load quiz data');
                    }
                }
            } finally {
                // Only update state if not aborted
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        
        // Start the fetch
        fetchQuizData();
        
        // Cleanup function to abort any in-flight requests
        return () => {
            controller.abort();
            // Reset the ref when searchParams change or component unmounts
            if (searchParams !== undefined) {
                apiCallMadeRef.current = false;
            }
        };
    }, [searchParams]);

    // Show loading state or error
    if (isLoading || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-purple-800 mb-2">OverThinkerAI</h1>
                        <p className="text-xl text-gray-600">Your CS study buddy with wacky, unhinged explanations</p>
                    </div>
                    
                    <Card className="shadow-lg animate-fadeIn">
                        <CardContent className="pt-6 text-center">
                            {isLoading ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-purple-700">Generating Your Quiz...</h2>
                                    <div className="flex justify-center my-8">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 border-solid"></div>
                                    </div>
                                    <p className="text-gray-600">OverThinkerAI is crafting some wacky explanations just for you!</p>
                                </>
                            ) : error ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-red-600">Oops! Something Went Wrong</h2>
                                    <div className="my-6 p-4 bg-red-50 rounded-lg text-red-700 text-left">
                                        <p className="font-medium">Error: {error}</p>
                                    </div>
                                    <p className="text-gray-600 mb-4">Try uploading a document first or refreshing the page.</p>
                                    <Button
                                        onClick={() => router.push('/')}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        Return to Home
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-purple-700">No Quiz Questions Found</h2>
                                    <p className="text-gray-600 mb-4">Try uploading a document first or refreshing the page.</p>
                                    <Button
                                        onClick={() => router.push('/')}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        Return to Home
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    const handleCodeChange = (value) => {
        setCodeAnswer(value);
    };

    const handleNextQuestion = () => {
        const currentQ = questions[currentQuestion];
        let isCorrect = false;
        
        // Score calculation based on question type
        if (currentQ.type === "multiple_choice_question") {
            isCorrect = selectedAnswer === currentQ.correct_option_index;
        } else if (currentQ.type === "true_false_question") {
            isCorrect = selectedAnswer === currentQ.answer;
        } else if (currentQ.type === "code_question" && codeAnswer.trim() !== '') {
            // For code questions, we'll consider them correct if they've written something
            // In a real app, you'd want to evaluate the code more thoroughly
            isCorrect = true;
        } else if (currentQ.type === "free_response_question" && freeResponseAnswer.trim() !== '') {
            // For free response questions, we'll consider them correct if they've written something
            // In a real app, you'd want to evaluate the response more thoroughly
            isCorrect = true;
        }
        
        // Only update the score if this question hasn't been answered correctly before
        if (isCorrect && !answeredQuestions[currentQuestion]) {
            setScore(prevScore => prevScore + 1);
            // Mark this question as correctly answered
            setAnsweredQuestions(prev => ({
                ...prev,
                [currentQuestion]: true
            }));
        }

        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setCodeAnswer('');
            setFreeResponseAnswer('');
            setShowHint(false);
            setShowExplanation(false);
        } else {
            setShowResults(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setCodeAnswer('');
        setScore(0);
        setAnsweredQuestions({});
        setShowResults(false);
        setShowHint(false);
        setShowExplanation(false);
    };

    const renderExplanation = (explanation) => {
        if (!explanation) return null;
        
        return (
            <div className="mt-4">
                <Button
                    onClick={() => setShowExplanation(!showExplanation)}
                    variant="outline"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 flex items-center gap-2"
                    size="sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {showExplanation ? 'Hide Explanation' : 'Give Up & Show Explanation'}
                </Button>
                {showExplanation && (
                    <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-gray-700">
                        {explanation}
                    </div>
                )}
            </div>
        );
    };

    const renderHint = (hint, explanation) => {
        if (!hint) return null;
        
        return (
            <div className="mt-4">
                <Button
                    onClick={() => setShowHint(!showHint)}
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center gap-2"
                    size="sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </Button>
                {showHint && (
                    <div className="mt-2 p-4 bg-purple-50 border border-purple-200 rounded-lg text-gray-700">
                        {hint}
                        {renderExplanation(explanation)}
                    </div>
                )}
            </div>
        );
    };

    const renderQuestion = () => {
        const currentQ = questions[currentQuestion];

        switch (currentQ.type) {
            case "explanation":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-purple-800">{currentQ.title}</h3>
                        <div className="prose max-w-none p-4 bg-purple-50 border border-purple-100 rounded-lg">
                            {currentQ.content}
                        </div>
                    </div>
                );

            case "multiple_choice_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-800">{currentQ.question}</p>
                        <div className="space-y-3">
                            {currentQ.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors quiz-option ${
                                        selectedAnswer === index
                                            ? 'quiz-option-selected'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 ${selectedAnswer === index ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`}>
                                        {selectedAnswer === index && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                    </div>
                                    <span className={selectedAnswer === index ? 'font-medium text-purple-900' : 'text-gray-700'}>{option}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                        </div>
                    </div>
                );

            case "code_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-800">{currentQ.prompt}</p>
                        <div className="h-[300px] border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <Editor
                                height="100%"
                                defaultLanguage={currentQ.language || 'javascript'}
                                defaultValue={currentQ.starter_code || '// Write your code here'}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Language: {currentQ.language || 'javascript'}</p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => {
                                    if (currentQ.starter_code) {
                                        setCodeAnswer(currentQ.starter_code);
                                    }
                                }}
                            >
                                Reset Code
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                        </div>
                    </div>
                );

            case "true_false_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-800">{currentQ.question}</p>
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => handleAnswerSelect(true)}
                                variant={selectedAnswer === true ? "default" : "outline"}
                                className={selectedAnswer === true ? "bg-purple-600 hover:bg-purple-700" : "border-gray-200 hover:bg-gray-50"}
                                size="lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                True
                            </Button>
                            <Button
                                onClick={() => handleAnswerSelect(false)}
                                variant={selectedAnswer === false ? "default" : "outline"}
                                className={selectedAnswer === false ? "bg-purple-600 hover:bg-purple-700" : "border-gray-200 hover:bg-gray-50"}
                                size="lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                False
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                        </div>
                    </div>
                );

            case "free_response_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-800">{currentQ.question}</p>
                        <textarea
                            className="w-full p-4 mt-4 border-2 border-gray-200 rounded-lg focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 outline-none transition-colors"
                            placeholder="Enter your answer here..."
                            onChange={(e) => setFreeResponseAnswer(e.target.value)}
                            rows={6}
                        />
                        <div className="flex flex-col gap-2 mt-6">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                        </div>
                    </div>
                );

            case "quiz_end_summary":
                setShowResults(true);
                return null;

            default:
                return null;
        }
    };

    if (showResults) {
        const summary = questions.find(q => q.type === "quiz_end_summary");
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-purple-800 mb-2">OverThinkerAI</h1>
                        <p className="text-xl text-gray-600">Your CS study buddy with wacky, unhinged explanations</p>
                    </div>
                    
                    <Card className="border-2 border-green-200 shadow-lg animate-fadeIn">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center text-green-700 flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Quiz Complete!
                            </CardTitle>
                            <CardDescription className="text-center">Let&apos;s see how you did</CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                                <p className="text-xl font-semibold text-green-800 mb-2">
                                    Your Score: {score} out of {questions.filter(q => 
                                    ["multiple_choice_question", "true_false_question", "code_question", "free_response_question"].includes(q.type)
                                    ).length}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                    <div 
                                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                                        style={{
                                            width: `${Math.max(1, Math.round(score / Math.max(1, questions.filter(q => 
                                                ["multiple_choice_question", "true_false_question", "code_question", "free_response_question"].includes(q.type)
                                            ).length) * 100))}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {score === 0 ? "Keep practicing!" :
                                     score < 3 ? "Good start!" :
                                     score < 5 ? "Well done!" :
                                     "Excellent work!"}
                                </p>
                            </div>
                            
                            {summary && (
                                <div className="mt-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                                    <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                                        <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Feedback
                                    </h3>
                                    <p className="text-gray-700">{summary.feedback}</p>
                                </div>
                            )}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between">
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                                Return Home
                            </Button>
                            
                            <Button
                                onClick={handleRestart}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Restart Quiz
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const isAnswerable = ["multiple_choice_question", "true_false_question", "code_question", "free_response_question"].includes(currentQ.type);
    const canProceed = isAnswerable ? (
        currentQ.type === "code_question" ? codeAnswer.trim() !== '' :
        selectedAnswer !== null
    ) : true;

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-purple-800 mb-2">OverThinkerAI</h1>
                    <p className="text-xl text-gray-600">Your CS study buddy with wacky, unhinged explanations</p>
                </div>
                
                {/* Progress bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                        <span>{Math.round((currentQuestion / (questions.length - 1)) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.round((currentQuestion / (questions.length - 1)) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question content */}
                <Card className="border-2 border-purple-200 shadow-lg animate-fadeIn">
                    <CardHeader>
                        <CardTitle className="text-xl text-purple-700 flex items-center">
                            {currentQ.type === "explanation" ? (
                                <>
                                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Learning
                                </>
                            ) : currentQ.type === "multiple_choice_question" || currentQ.type === "true_false_question" ? (
                                <>
                                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Question
                                </>
                            ) : currentQ.type === "code_question" ? (
                                <>
                                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                    </svg>
                                    Coding Challenge
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Free Response
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {currentQ.type === "explanation" ? "Read carefully to understand the concept" : 
                             currentQ.type === "multiple_choice_question" ? "Select the best answer" :
                             currentQ.type === "true_false_question" ? "Determine if the statement is true or false" :
                             currentQ.type === "code_question" ? "Write code to solve the problem" :
                             currentQ.type === "free_response_question" ? "Write your answer" :
                             "Write your answer"}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        {renderQuestion()}
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={handleNextQuestion}
                            disabled={!canProceed}
                            className={canProceed ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                        >
                            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default QuizPage; 