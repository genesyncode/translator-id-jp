
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { dbService } from '@/lib/indexeddb';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizData {
  level: string;
  questions: Question[];
}

const Quiz = () => {
  const { isProUser } = useAuthStore();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const levels = [
    { id: 'n4', name: 'JLPT N4', description: 'Level menengah bawah', isPro: false },
    { id: 'n3', name: 'JLPT N3', description: 'Level menengah', isPro: true }
  ];

  const loadQuiz = async (level: string) => {
    try {
      const response = await fetch(`/data/jlpt/${level}.json`);
      const data = await response.json();
      setQuizData(data);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowResult(false);
      setAnswers(new Array(data.questions.length).fill(null));
      setQuizCompleted(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kuis",
        variant: "destructive"
      });
    }
  };

  const handleLevelSelect = (level: string, isPro: boolean) => {
    if (isPro && !isProUser) {
      toast({
        title: "Fitur Premium",
        description: "Upgrade ke Pro untuk mengakses JLPT N3",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedLevel(level);
    loadQuiz(level);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (selectedAnswer === quizData!.questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quizData!.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: (number | null)[]) => {
    const finalScore = finalAnswers.reduce((acc, answer, index) => {
      return answer === quizData!.questions[index].correct ? acc + 1 : acc;
    }, 0);

    setScore(finalScore);
    setQuizCompleted(true);
    setShowResult(true);

    // Save score to IndexedDB
    await dbService.addJLPTScore({
      level: quizData!.level,
      score: finalScore,
      totalQuestions: quizData!.questions.length
    });

    toast({
      title: "Kuis Selesai!",
      description: `Skor Anda: ${finalScore}/${quizData!.questions.length}`,
    });
  };

  const resetQuiz = () => {
    setSelectedLevel('');
    setQuizData(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
    setQuizCompleted(false);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                JLPT Quiz
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Uji kemampuan bahasa Jepang Anda dengan kuis JLPT
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {levels.map((level) => (
                <Card 
                  key={level.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    level.isPro && !isProUser ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleLevelSelect(level.id, level.isPro)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{level.name}</span>
                      {level.isPro && (
                        <div className="flex items-center space-x-2">
                          {isProUser ? (
                            <Crown className="text-amber-500" size={20} />
                          ) : (
                            <Lock className="text-gray-400" size={20} />
                          )}
                          <Badge variant={isProUser ? "default" : "secondary"}>
                            {isProUser ? "Pro" : "Premium"}
                          </Badge>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {level.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>• 10 soal tata bahasa</p>
                      <p>• Penjelasan untuk setiap jawaban</p>
                      <p>• Skor tersimpan otomatis</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizData!.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Trophy className="text-amber-500" />
                  <span>Hasil Kuis {quizData!.level}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
                    {score}/{quizData!.questions.length}
                  </div>
                  <div className={`text-2xl ${getScoreColor(percentage)}`}>
                    {percentage}%
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Jawaban:</h3>
                  {quizData!.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">
                          Soal {index + 1}
                        </span>
                        <Badge 
                          variant={answers[index] === question.correct ? "default" : "destructive"}
                        >
                          {answers[index] === question.correct ? "Benar" : "Salah"}
                        </Badge>
                      </div>
                      <p className="mb-2">{question.question}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Jawaban Anda: </span>
                          <span className={answers[index] === question.correct ? "text-green-600" : "text-red-600"}>
                            {answers[index] !== null ? question.options[answers[index]!] : "Tidak dijawab"}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Jawaban Benar: </span>
                          <span className="text-green-600">
                            {question.options[question.correct]}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Penjelasan: </span>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button onClick={resetQuiz} className="flex-1">
                    <RotateCcw size={16} className="mr-2" />
                    Kuis Lain
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => loadQuiz(selectedLevel)}
                    className="flex-1"
                  >
                    Ulangi Kuis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Kuis {quizData.level}</CardTitle>
                <Badge variant="outline">
                  {currentQuestion + 1} / {quizData.questions.length}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {currentQ.question}
                </h2>
                
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="mr-3 font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz}
                >
                  Keluar
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                >
                  {currentQuestion + 1 === quizData.questions.length ? 'Selesai' : 'Selanjutnya'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
