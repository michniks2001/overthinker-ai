"use client"

import { useState } from 'react';
import Editor from '@monaco-editor/react';

const QuizPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [codeAnswer, setCodeAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    // Sample questions
    // TODO: Replace with AI response
    const questions = [
        {
          "type": "explanation",
          "title": "What is a Binary Tree?",
          "content": "A binary tree is a hierarchical data structure in which each node has at most two children, commonly referred to as the left and right child. It is used in various algorithms for searching, sorting, and expression parsing."
        },
        {
          "type": "multiple_choice_question",
          "question": "Which of the following statements is true about binary search trees (BST)?",
          "options": [
            "All nodes have exactly two children.",
            "Left child nodes contain values less than the parent.",
            "Right child nodes contain values less than the parent.",
            "BSTs do not allow duplicate values."
          ],
          "correct_option_index": 1,
          "explanation": "In a BST, all left descendants are less than the current node, and all right descendants are greater.",
          "hint": "Think about the ordering property of BSTs. What must be true about values in the left subtree compared to the root?"
        },
        {
          "type": "code_question",
          "prompt": "Write a recursive function in Python that counts the number of nodes in a binary tree.",
          "language": "python",
          "starter_code": "def count_nodes(node):\n    # Your code here\n    pass",
          "solution": "def count_nodes(node):\n    if node is None:\n        return 0\n    return 1 + count_nodes(node.left) + count_nodes(node.right)",
          "hint": "Remember the base case: an empty tree has 0 nodes. Then, for each node, count 1 plus the nodes in its left and right subtrees.",
          "explanation": "The solution uses recursion to count nodes. The base case is when the node is None (empty tree), which returns 0. For any other node, we count 1 (the current node) plus the count of nodes in its left subtree plus the count of nodes in its right subtree. This recursive approach naturally traverses the entire tree."
        },
        {
          "type": "true_false_question",
          "question": "A full binary tree is one where every node has either 0 or 2 children.",
          "answer": true,
          "explanation": "Correct! A full binary tree has no nodes with only one child.",
          "hint": "Consider what makes a tree 'full'. Can a node have exactly one child in a full binary tree?"
        },
        {
          "type": "free_response_question",
          "question": "What is the time complexity of the binary search tree insertion operation?",
          "explanation": "The time complexity of binary search tree insertion is O(log n) because the tree is balanced. In the worst case, the tree may become unbalanced, resulting in O(n) time complexity.",
          "hint": "Consider the worst-case scenario for the tree's balance."
        },
        {
          "type": "quiz_end_summary",
          "feedback": "Great work! You seem to understand the basics of binary trees. You might want to revisit tree traversal algorithms next."
        }
    ];

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