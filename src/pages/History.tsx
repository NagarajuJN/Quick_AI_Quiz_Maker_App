import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Calendar, Trophy, Target, Hash, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizHistoryEntry {
  id: number;
  topic: string;
  difficulty: string;
  questionCount: number;
  score: number;
  totalQuestions: number;
  completionTime?: number; // Optional for backward compatibility
  date: string;
  timestamp: string;
}

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("quiz-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("quiz-history");
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All quiz history has been removed.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold gradient-text mb-2">Quiz History</h1>
              <p className="text-xl text-muted-foreground">
                Track your quiz performance over time
              </p>
            </div>
          </div>

          {/* Empty State */}
          <Card className="glass-card">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Quiz History Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start taking quizzes to see your performance history here!
              </p>
              <Button onClick={() => navigate("/")} className="gap-2 bg-gradient-primary">
                Take Your First Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalQuizzes = history.length;
  const averageScore = history.reduce((acc, entry) => acc + (entry.score / entry.totalQuestions), 0) / totalQuizzes;
  const totalQuestions = history.reduce((acc, entry) => acc + entry.totalQuestions, 0);
  const totalCorrect = history.reduce((acc, entry) => acc + entry.score, 0);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Quiz History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your quiz history will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground">
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-2">Quiz History</h1>
            <p className="text-xl text-muted-foreground">
              Your quiz performance over time
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card quiz-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{totalQuizzes}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </CardContent>
          </Card>

          <Card className="glass-card quiz-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{Math.round(averageScore * 100)}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>

          <Card className="glass-card quiz-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </CardContent>
          </Card>

          <Card className="glass-card quiz-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{totalCorrect}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Recent Quizzes</h2>
          
          {history.map((entry) => (
            <Card key={entry.id} className="glass-card quiz-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{entry.topic}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getDifficultyColor(entry.difficulty)}>
                          {entry.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {entry.questionCount} questions
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(entry.score, entry.totalQuestions)}`}>
                      {entry.score}/{entry.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((entry.score / entry.totalQuestions) * 100)}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.date)}
                  </div>
                  {entry.completionTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(entry.completionTime)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;