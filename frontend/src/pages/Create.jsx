import React, { useState } from 'react';

function Create(props) {
    const [quizData, setQuizData] = useState({
        name: '',
        startTime: '',
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOptionIndex: 0,
        difficulty: 'easy'
    });

    const [editingIndex, setEditingIndex] = useState(null);

    const handleQuizDataChange = (field, value) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleQuestionChange = (field, value) => {
        setCurrentQuestion(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addQuestion = () => {
        if (currentQuestion.question.trim() && 
            currentQuestion.option1.trim() && 
            currentQuestion.option2.trim() && 
            currentQuestion.option3.trim() && 
            currentQuestion.option4.trim()) {
            
            if (editingIndex !== null) {
                // Update existing question
                setQuizData(prev => ({
                    ...prev,
                    questions: prev.questions.map((q, index) => 
                        index === editingIndex ? { ...currentQuestion } : q
                    )
                }));
                setEditingIndex(null);
            } else {
                // Add new question
                setQuizData(prev => ({
                    ...prev,
                    questions: [...prev.questions, { ...currentQuestion }]
                }));
            }
            
            setCurrentQuestion({
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correctOptionIndex: 0,
                difficulty: 'easy'
            });
        }
    };

    const removeQuestion = (index) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const editQuestion = (index) => {
        const questionToEdit = quizData.questions[index];
        setCurrentQuestion(questionToEdit);
        setEditingIndex(index);
    };

    const cancelEdit = () => {
        setCurrentQuestion({
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctOptionIndex: 0,
            difficulty: 'easy'
        });
        setEditingIndex(null);
    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                const questions = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.trim());
                        const question = {
                            question: values[0] || '',
                            option1: values[1] || '',
                            option2: values[2] || '',
                            option3: values[3] || '',
                            option4: values[4] || '',
                            correctOptionIndex: parseInt(values[5]) || 0,
                            difficulty: values[6] || 'easy'
                        };
                        questions.push(question);
                    }
                }
                
                setQuizData(prev => ({
                    ...prev,
                    questions: [...prev.questions, ...questions]
                }));
            };
            reader.readAsText(file);
        }
    };

    const validateDifficultyDistribution = () => {
        const totalQuestions = quizData.questions.length;
        if (totalQuestions === 0) {
            return { isValid: false, message: 'Please add at least one question.' };
        }

        const easyCount = quizData.questions.filter(q => q.difficulty === 'easy').length;
        const mediumCount = quizData.questions.filter(q => q.difficulty === 'medium').length;
        const hardCount = quizData.questions.filter(q => q.difficulty === 'hard').length;

        const easyPercentage = (easyCount / totalQuestions) * 100;
        const mediumPercentage = (mediumCount / totalQuestions) * 100;
        const hardPercentage = (hardCount / totalQuestions) * 100;

        // Allow some tolerance (±5%) for the percentages
        const tolerance = 5;
        const isEasyValid = Math.abs(easyPercentage - 50) <= tolerance;
        const isMediumValid = Math.abs(mediumPercentage - 25) <= tolerance;
        const isHardValid = Math.abs(hardPercentage - 25) <= tolerance;

        if (!isEasyValid || !isMediumValid || !isHardValid) {
            return {
                isValid: false,
                message: `Difficulty distribution must be: 50% easy, 25% medium, 25% hard. Current: ${easyPercentage.toFixed(1)}% easy, ${mediumPercentage.toFixed(1)}% medium, ${hardPercentage.toFixed(1)}% hard.`
            };
        }

        return { isValid: true };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validation = validateDifficultyDistribution();
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        console.log('Quiz Data:', quizData);
        // Here you would typically send the data to your backend
        alert('Quiz created successfully! Check console for data.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                    <h1 className="text-4xl font-bold text-white text-center mb-8 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                        Create Your Quiz
                    </h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Quiz Basic Info */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-2xl font-semibold text-white mb-6">Quiz Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Quiz Name
                                    </label>
                                    <input
                                        type="text"
                                        value={quizData.name}
                                        onChange={(e) => handleQuizDataChange('name', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter quiz name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={quizData.startTime}
                                        onChange={(e) => handleQuizDataChange('startTime', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CSV Upload */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-2xl font-semibold text-white mb-4">Bulk Upload Questions</h2>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
                                >
                                    Upload CSV
                                </label>
                                <span className="text-gray-300 text-sm">
                                    CSV format: question, option1, option2, option3, option4, correctOptionIndex, difficulty
                                </span>
                            </div>
                        </div>

                        {/* Add Questions */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-2xl font-semibold text-white mb-6">Add Questions</h2>
                            
                            {/* Current Question Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Question Text
                                    </label>
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => handleQuestionChange('question', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your question"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(num => (
                                        <div key={num}>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Option {num}
                                            </label>
                                            <input
                                                type="text"
                                                value={currentQuestion[`option${num}`]}
                                                onChange={(e) => handleQuestionChange(`option${num}`, e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                                placeholder={`Option ${num}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Correct Answer
                                        </label>
                                        <select
                                            value={currentQuestion.correctOptionIndex}
                                            onChange={(e) => handleQuestionChange('correctOptionIndex', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                        >
                                            <option value={0}>Option 1</option>
                                            <option value={1}>Option 2</option>
                                            <option value={2}>Option 3</option>
                                            <option value={3}>Option 4</option>
                                        </select>
                                    </div>
                                    
        <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Difficulty
                                        </label>
                                        <select
                                            value={currentQuestion.difficulty}
                                            onChange={(e) => handleQuestionChange('difficulty', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
                                    >
                                        {editingIndex !== null ? 'Update Question' : 'Add Question'}
                                    </button>
                                    {editingIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Difficulty Distribution Indicator */}
                            {quizData.questions.length > 0 && (
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Difficulty Distribution</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['easy', 'medium', 'hard'].map(difficulty => {
                                            const count = quizData.questions.filter(q => q.difficulty === difficulty).length;
                                            const percentage = quizData.questions.length > 0 ? (count / quizData.questions.length) * 100 : 0;
                                            const targetPercentage = difficulty === 'easy' ? 50 : 25;
                                            const isWithinTolerance = Math.abs(percentage - targetPercentage) <= 5;
                                            
                                            return (
                                                <div key={difficulty} className="text-center">
                                                    <div className={`text-2xl font-bold ${
                                                        isWithinTolerance ? 'text-green-400' : 'text-yellow-400'
                                                    }`}>
                                                        {percentage.toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-gray-300 capitalize">{difficulty}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {count} / {quizData.questions.length} questions
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Target: {targetPercentage}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <span className={`text-sm px-3 py-1 rounded-full ${
                                            quizData.questions.length >= 4 && 
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'easy').length / quizData.questions.length) * 100 - 50) <= 5 &&
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'medium').length / quizData.questions.length) * 100 - 25) <= 5 &&
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'hard').length / quizData.questions.length) * 100 - 25) <= 5
                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                        }`}>
                                            {quizData.questions.length >= 4 && 
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'easy').length / quizData.questions.length) * 100 - 50) <= 5 &&
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'medium').length / quizData.questions.length) * 100 - 25) <= 5 &&
                                            Math.abs((quizData.questions.filter(q => q.difficulty === 'hard').length / quizData.questions.length) * 100 - 25) <= 5
                                                ? '✓ Distribution Valid'
                                                : '⚠ Adjust Distribution'
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Questions List */}
                            {quizData.questions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white">Added Questions ({quizData.questions.length})</h3>
                                    {quizData.questions.map((question, index) => (
                                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-white font-medium mb-2">{question.question}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        {[1, 2, 3, 4].map(num => (
                                                            <span 
                                                                key={num}
                                                                className={`px-2 py-1 rounded ${
                                                                    question.correctOptionIndex === num - 1 
                                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                                                        : 'bg-gray-500/20 text-gray-300'
                                                                }`}
                                                            >
                                                                {num}. {question[`option${num}`]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                                            {question.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => editQuestion(index)}
                                                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-all duration-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(index)}
                                                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-all duration-300"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg"
                            >
                                Create Quiz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Create;