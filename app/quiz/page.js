"use client"

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSearchParams } from 'next/navigation';

const QuizPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [codeAnswer, setCodeAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [freeResponseAnswer, setFreeResponseAnswer] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const studyData = searchParams.get('studyData');
        if (studyData) {
            try {
                const parsedData = JSON.parse(studyData);
                // The questions are nested under the 'questions' key
                setQuestions(parsedData.questions || []);
            } catch (error) {
                console.error('Error parsing study data:', error);
            }
        }
    }, [searchParams]);

    // If no questions are loaded yet, show loading state
    if (questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-black">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Loading Quiz...</h2>
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
        
        // Score calculation based on question type
        if (currentQ.type === "multiple_choice_question" && selectedAnswer === currentQ.correct_option_index) {
            setScore(score + 1);
        } else if (currentQ.type === "true_false_question" && selectedAnswer === currentQ.answer) {
            setScore(score + 1);
        } else if (currentQ.type === "code_question" && codeAnswer.trim() !== '') {
            // TODO: Score free response/code questions with AI evaluation
            setScore(score + 1);
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
        setShowResults(false);
        setShowHint(false);
        setShowExplanation(false);
    };

    const renderExplanation = (explanation) => {
        if (!explanation) return null;
        
        return (
            <div className="mt-4">
                <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-red-500 hover:text-red-600 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {showExplanation ? 'Hide Explanation' : 'Give Up & Show Explanation'}
                </button>
                {showExplanation && (
                    <div className="mt-2 p-4 bg-red-50 rounded-lg text-red-800">
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
                <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                {showHint && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg text-blue-800">
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
                        <h3 className="text-xl font-semibold">{currentQ.title}</h3>
                        <div className="prose max-w-none">
                            {currentQ.content}
                        </div>
                    </div>
                );

            case "multiple_choice_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg">{currentQ.question}</p>
                        <div className="space-y-2">
                            {currentQ.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                                        selectedAnswer === index
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        checked={selectedAnswer === index}
                                        onChange={() => handleAnswerSelect(index)}
                                        className="mr-3"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                            {/* {renderExplanation(currentQ.explanation)} */}
                        </div>
                    </div>
                );

            case "code_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg">{currentQ.prompt}</p>
                        <div className="h-[300px] border rounded-lg overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage={currentQ.language}
                                defaultValue={currentQ.starter_code}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                            {/* {renderExplanation(currentQ.explanation)} */}
                        </div>
                    </div>
                );

            case "true_false_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg">{currentQ.question}</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleAnswerSelect(true)}
                                className={`px-6 py-2 rounded-lg border transition-colors ${
                                    selectedAnswer === true
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                }`}
                            >
                                True
                            </button>
                            <button
                                onClick={() => handleAnswerSelect(false)}
                                className={`px-6 py-2 rounded-lg border transition-colors ${
                                    selectedAnswer === false
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                }`}
                            >
                                False
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                            {/* {renderExplanation(currentQ.explanation)} */}
                        </div>
                    </div>
                );

            case "free_response_question":
                return (
                    <div className="space-y-4">
                        <p className="text-lg">{currentQ.question}</p>
                        <textarea
                            className="w-full p-4 mt-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            placeholder="Enter your answer here..."
                            onChange={(e) => setFreeResponseAnswer(e.target.value)}
                        />
                        <div className="flex flex-col gap-2">
                            {renderHint(currentQ.hint, currentQ.explanation)}
                            {/* {renderExplanation(currentQ.explanation)} */}
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
            <div className="max-w-2xl mx-auto p-6 text-black">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
                    <p className="text-lg mb-4">Your score: {score} out of {questions.filter(q => 
                        ["multiple_choice_question", "true_false_question", "code_question"].includes(q.type)
                    ).length}</p>
                    {summary && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-lg">{summary.feedback}</p>
                        </div>
                    )}
                    <button
                        onClick={handleRestart}
                        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Restart Quiz
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const isAnswerable = ["multiple_choice_question", "true_false_question", "code_question"].includes(currentQ.type);
    const canProceed = isAnswerable ? (
        currentQ.type === "code_question" ? codeAnswer.trim() !== '' :
        selectedAnswer !== null
    ) : true;

    return (
        <div className="max-w-2xl mx-auto p-6 text-black">

            {/* Question content */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">
                    {currentQ.type === "explanation" ? "Learning" : 
                     currentQ.type === "hint" ? "Hint" :
                     "Question"}
                </h2>
                
                {renderQuestion()}

                {/* Navigation buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextQuestion}
                        disabled={!canProceed}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            canProceed
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPage; 