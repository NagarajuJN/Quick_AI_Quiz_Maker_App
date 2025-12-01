import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Settings,
  History,
  Sparkles,
  ArrowDown,
  Zap,
  Target,
  Users,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "medium",
    model: "gemini-1.5-flash",
    questionCount: 10,
    viewMode: "list", // "list" or "single"
    apiKey: localStorage.getItem("gemini-api-key") || "",
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or default to true if not found
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // Default to dark
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleStartQuiz = () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a quiz topic to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }

    // Save API key to localStorage
    localStorage.setItem("gemini-api-key", formData.apiKey);

    // Navigate to quiz page with settings
    navigate("/quiz", {
      state: {
        settings: formData,
      },
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col justify-center items-center p-4 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Navigation */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/history")}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">View History</span>
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {isDarkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Main Hero Content */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 rounded-3xl bg-gradient-primary shadow-2xl animate-glow">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-6 animate-fade-in">
              AI Quiz Master
            </h1>

            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform any topic into an engaging quiz experience with the
              power of
              <span className="gradient-text font-semibold">
                {" "}
                Artificial Intelligence
              </span>
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="flex flex-col items-center p-6 glass-card rounded-2xl quiz-card">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Generation</h3>
                <p className="text-muted-foreground text-center">
                  Generate custom quizzes in seconds on any topic you can
                  imagine
                </p>
              </div>

              <div className="flex flex-col items-center p-6 glass-card rounded-2xl quiz-card">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Adaptive Difficulty</h3>
                <p className="text-muted-foreground text-center">
                  Choose from easy, medium, or hard difficulty levels for
                  perfect challenge
                </p>
              </div>

              <div className="flex flex-col items-center p-6 glass-card rounded-2xl quiz-card">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-muted-foreground text-center">
                  Monitor your learning journey with detailed history and
                  analytics
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={scrollToForm}
              size="lg"
              className="text-xl px-12 py-6 h-auto bg-gradient-primary hover:opacity-90 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Create Your Quiz
              <ChevronDown className="w-6 h-6 ml-3 animate-bounce" />
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Quiz Configuration Section */}
      <div
        ref={formRef}
        className="min-h-screen p-4 bg-background/80 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto py-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Configure Your Quiz
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Customize every aspect of your AI-generated quiz to create the
              perfect learning experience
            </p>
          </div>

          {/* Main Form */}
          <Card className="glass-card quiz-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Settings className="w-6 h-6" />
                Quiz Settings
              </CardTitle>
              <CardDescription className="text-base">
                Fine-tune your quiz parameters for the best experience
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 p-6 md:p-8">
              {/* Topic Input */}
              <div className="space-y-4">
                <Label htmlFor="topic" className="text-xl font-bold text-foreground">
                  Quiz Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., JavaScript Programming, World History, Biology..."
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  className="text-lg h-14 px-4 py-3 border-2 border-input focus:border-primary transition-colors duration-200 rounded-lg"
                />
                <p className="text-base text-muted-foreground mt-2">
                  Enter any topic you'd like to learn about - the AI will create
                  relevant questions
                </p>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Difficulty */}
                <div className="space-y-4">
                  <Label className="text-xl font-bold text-foreground">
                    Difficulty Level
                  </Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger className="h-14 text-lg px-4 py-3 border-2 border-input focus:border-primary transition-colors duration-200 rounded-lg">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-card-foreground border border-border rounded-lg shadow-lg">
                      <SelectItem value="easy" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        🟢 Easy - Basic concepts and definitions
                      </SelectItem>
                      <SelectItem value="medium" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        🟡 Medium - Intermediate understanding
                      </SelectItem>
                      <SelectItem value="hard" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        🔴 Hard - Advanced knowledge required
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div className="space-y-4">
                  <Label className="text-xl font-bold text-foreground">AI Model</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, model: value }))
                    }
                  >
                    <SelectTrigger className="h-14 text-lg px-4 py-3 border-2 border-input focus:border-primary transition-colors duration-200 rounded-lg">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-card-foreground border border-border rounded-lg shadow-lg">
                      <SelectItem value="gemini-1.5-flash" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        ⚡ Gemini 1.5 Flash - Fast & efficient
                      </SelectItem>
                      <SelectItem value="gemini-1.5-pro" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        💎 Gemini 1.5 Pro - Enhanced reasoning
                      </SelectItem>
                      <SelectItem value="gemini-pro" className="text-base py-3 px-4 hover:bg-accent hover:text-accent-foreground">
                        🚀 Gemini Pro - Advanced capabilities
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-4">
                  <Label
                    htmlFor="questionCount"
                    className="text-xl font-bold text-foreground"
                  >
                    Number of Questions
                  </Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="5"
                    max="20"
                    value={formData.questionCount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        questionCount: Math.max(
                          5,
                          Math.min(20, parseInt(e.target.value) || 10)
                        ),
                      }))
                    }
                    className="h-14 text-lg px-4 py-3 border-2 border-input focus:border-primary transition-colors duration-200 rounded-lg"
                  />
                  <p className="text-base text-muted-foreground mt-2">
                    Choose between 5-20 questions for your quiz
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="space-y-4">
                  <Label className="text-xl font-bold text-foreground">Display Mode</Label>
                  <div className="flex items-center justify-between p-5 border-2 border-input rounded-lg bg-background/50 backdrop-blur-sm">
                    <div>
                      <div className="font-semibold text-lg text-foreground">
                        {formData.viewMode === "list"
                          ? "📋 List View"
                          : "📄 One at a Time"}
                      </div>
                      <div className="text-base text-muted-foreground mt-1">
                        {formData.viewMode === "list"
                          ? "Show all questions on one page"
                          : "Display questions one by one"}
                      </div>
                    </div>
                    <Switch
                      checked={formData.viewMode === "single"}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          viewMode: checked ? "single" : "list",
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-4">
                <Label htmlFor="apiKey" className="text-xl font-bold text-foreground">
                  Gemini API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  className="text-lg h-14 px-4 py-3 border-2 border-input focus:border-primary transition-colors duration-200 rounded-lg"
                />
                <div className="text-base text-muted-foreground space-y-1 mt-2">
                  <p>🔒 Your API key is stored locally and never shared</p>
                  <p>
                    🔗 Get your free API key from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartQuiz}
                className="w-full h-16 text-xl font-bold bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group rounded-lg"
                size="lg"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Generate & Start Quiz
                <ArrowDown className="w-6 h-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
