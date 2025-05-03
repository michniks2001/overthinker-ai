"use client"

import { useState } from 'react';

const QuizPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [freeResponseAnswer, setFreeResponseAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Sample questions, should be replaced with AI response
    const questions = [
        {
            question: "What is the capital of France?",
            type: "multiple choice",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2
        },
        {
            question: "What is 2 + 2?",
            type: "free response"
        }
    ];

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    const handleFreeResponseChange = (e) => {
        setFreeResponseAnswer(e.target.value);
    };

    const handleNextQuestion = () => {
        const currentQ = questions[currentQuestion];
        
        if (currentQ.type === "multiple choice" && selectedAnswer === currentQ.correctAnswer) {
            setScore(score + 1);
        } else if (currentQ.type === "free response" && freeResponseAnswer.trim() !== '') {
            // For now, we'll just count free response answers as correct if they're not empty
            // In a real implementation, you might want to use AI to evaluate the answer
            setScore(score + 1);
        }

        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setFreeResponseAnswer('');
        } else {
            setShowResults(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setFreeResponseAnswer('');
        setScore(0);
        setShowResults(false);
    };

    if (showResults) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-black">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Tutor: ....</h2>
                </div>
                <br></br>
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
                    <p className="text-lg mb-4">Your score: {score} out of {questions.length}</p>
                    <button
                        onClick={handleRestart}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Restart Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 text-black">

            {/* ai tutor speech window */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Tutor: ....</h2>
            </div>

            <br></br>

            {/* question and answer options */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* question x / total */}
                <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1} of {questions.length}</h2>
                {/* question text */}
                <p className="text-lg mb-6">{questions[currentQuestion].question}</p>
                
                {/* multiple choice options */}
                {questions[currentQuestion].type === "multiple choice" ? (
                    <div className="space-y-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                    selectedAnswer === index
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                ) : ( 
                    <div className="space-y-4">
                        <textarea
                            value={freeResponseAnswer}
                            onChange={handleFreeResponseChange}
                            placeholder="Type your answer here..."
                            className="w-full p-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                        />
                    </div>
                )}

                {/* // next question button */}
                <button
                    onClick={handleNextQuestion}
                    disabled={questions[currentQuestion].type === "multiple choice" ? selectedAnswer === null : freeResponseAnswer.trim() === ''}
                    className={`mt-6 px-6 py-2 rounded transition-colors ${
                        (questions[currentQuestion].type === "multiple choice" ? selectedAnswer === null : freeResponseAnswer.trim() === '')
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};

export default QuizPage; 