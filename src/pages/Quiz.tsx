import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Home, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSettings {
  topic: string;
  difficulty: string;
  model: string;
  questionCount: number;
  viewMode: string;
  apiKey: string;
}

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer utility functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer when quiz begins
  const startTimer = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  };

  // Stop timer and return completion time
  const stopTimer = (): number => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (startTime) {
      const completionTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
      setCompletionTime(completionTimeSeconds);
      return completionTimeSeconds;
    }
    return 0;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const state = location.state as { settings: QuizSettings };
    if (!state?.settings) {
      toast({
        title: "No Quiz Settings",
        description: "Please configure your quiz from the home page.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    setSettings(state.settings);
    generateQuiz(state.settings);
  }, [location.state, navigate, toast]);

  const generateQuiz = async (settings: QuizSettings) => {
    setIsLoading(true);
    
    try {
      const prompt = `Generate ${settings.questionCount} multiple choice questions about ${settings.topic} with ${settings.difficulty} difficulty level. 
      
      Return the response as a valid JSON array with this exact structure:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
      
      Make sure:
      - Each question has exactly 4 options
      - correctAnswer is the index (0-3) of the correct option
      - Questions are clear and unambiguous
      - Return only the JSON array, no additional text`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error("No content generated");
      }

      // Clean and parse the JSON
      const cleanJson = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedQuestions = JSON.parse(cleanJson);
      
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error("Invalid question format");
      }

      setQuestions(parsedQuestions);
      setUserAnswers(new Array(parsedQuestions.length).fill(null));
      
      // Start the timer once questions are loaded
      startTimer();
      
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({
        title: "Quiz Generation Failed",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    // Stop the timer and get completion time
    const finalCompletionTime = stopTimer();
    
    const calculatedScore = questions.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Save to history with completion time
    const history = JSON.parse(localStorage.getItem("quiz-history") || "[]");
    const newEntry = {
      id: Date.now(),
      topic: settings?.topic,
      difficulty: settings?.difficulty,
      questionCount: questions.length,
      score: calculatedScore,
      totalQuestions: questions.length,
      completionTime: finalCompletionTime, // Save completion time in seconds
      date: new Date().toISOString(),
      timestamp: new Date().toLocaleString()
    };
    
    history.unshift(newEntry);
    localStorage.setItem("quiz-history", JSON.stringify(history));

    toast({
      title: "Quiz Completed!",
      description: `You scored ${calculatedScore}/${questions.length} in ${formatTime(finalCompletionTime)}`,
    });
  };

  const handleRetakeQuiz = () => {
    if (settings) {
      // Reset all states including timer
      setIsSubmitted(false);
      setScore(0);
      setCurrentQuestion(0);
      setStartTime(null);
      setElapsedTime(0);
      setCompletionTime(null);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      generateQuiz(settings);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <div className="animate-glow">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Generating Your Quiz</h2>
          <p className="text-muted-foreground">AI is crafting personalized questions for you...</p>
        </Card>
      </div>
    );
  }

  if (!settings || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  if (settings.viewMode === "single") {
    // Single question view
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
              <div className="flex items-center gap-4">
                {!isSubmitted && (
                  <Badge variant="outline" className="text-lg px-4 py-2 gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedTime)}
                  </Badge>
                )}
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {currentQuestion + 1} / {questions.length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {!isSubmitted ? (
            <Card className="glass-card quiz-card">
              <CardHeader>
                <CardTitle className="text-xl">
                  {question.question}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                    className={`quiz-option w-full p-4 text-left border-2 rounded-lg ${
                      userAnswers[currentQuestion] === index ? 'selected' : ''
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
                
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={userAnswers.some(answer => answer === null)}
                      className="gap-2 bg-gradient-primary"
                    >
                      Submit Quiz
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      className="gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Results for single view
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">
                  Quiz Complete! 🎉
                </CardTitle>
                <div className="text-6xl font-bold gradient-text">
                  {score}/{questions.length}
                </div>
                <p className="text-xl text-muted-foreground mb-2">
                  {Math.round((score / questions.length) * 100)}% Correct
                </p>
                {completionTime && (
                  <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>Completed in {formatTime(completionTime)}</span>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={handleRetakeQuiz} className="flex-1 gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Retake Quiz
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1 gap-2">
                    <Home className="w-4 h-4" />
                    New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // List view - all questions at once
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{settings.topic}</h1>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline">{settings.difficulty} • {questions.length} Questions</Badge>
                {!isSubmitted && (
                  <Badge variant="outline" className="gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedTime)}
                  </Badge>
                )}
              </div>
            </div>
            <div />
          </div>
        </div>

        {!isSubmitted ? (
          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="glass-card quiz-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {questionIndex + 1}
                    </span>
                    {question.question}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                      className={`quiz-option w-full p-4 text-left border-2 rounded-lg ${
                        userAnswers[questionIndex] === optionIndex ? 'selected' : ''
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center">
              <Button
                onClick={handleSubmitQuiz}
                disabled={userAnswers.some(answer => answer === null)}
                size="lg"
                className="gap-2 bg-gradient-primary"
              >
                Submit Quiz
                <CheckCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          // Results for list view
          <div className="space-y-6">
            <Card className="glass-card text-center">
              <CardHeader>
                <CardTitle className="text-3xl mb-2">
                  Quiz Complete! 🎉
                </CardTitle>
                <div className="text-6xl font-bold gradient-text mb-2">
                  {score}/{questions.length}
                </div>
                <p className="text-xl text-muted-foreground mb-2">
                  {Math.round((score / questions.length) * 100)}% Correct
                </p>
                {completionTime && (
                  <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>Completed in {formatTime(completionTime)}</span>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={handleRetakeQuiz} className="flex-1 gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Retake Quiz
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1 gap-2">
                    <Home className="w-4 h-4" />
                    New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Answer Review</h2>
              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">
                        {questionIndex + 1}
                      </span>
                      {question.question}
                      {userAnswers[questionIndex] === question.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-quiz-correct" />
                      ) : (
                        <XCircle className="w-5 h-5 text-quiz-incorrect" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      let className = "quiz-option w-full p-3 text-left border-2 rounded-lg cursor-default ";
                      
                      if (optionIndex === question.correctAnswer) {
                        className += "correct";
                      } else if (userAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer) {
                        className += "incorrect";
                      }
                      
                      return (
                        <div key={optionIndex} className={className}>
                          <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;