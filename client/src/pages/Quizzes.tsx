import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Plus, Play, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Quizzes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/quizzes', selectedQuiz?.id, 'questions'],
    enabled: !!selectedQuiz,
  });

  const { data: userAttempts = [] } = useQuery({
    queryKey: ['/api/user/quiz-attempts'],
    enabled: !!user,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      await apiRequest(`/api/quizzes/${selectedQuiz.id}/attempt`, 'POST', attemptData);
    },
    onSuccess: (result) => {
      setQuizCompleted(true);
      setScore(result.score);
      queryClient.invalidateQueries({ queryKey: ['/api/user/quiz-attempts'] });
      toast({
        title: "Quiz Completed!",
        description: `You scored ${result.score}/${questions.length}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setScore(0);
    
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const submitQuiz = () => {
    let correctAnswers = 0;
    const userAnswers: {[key: number]: string} = {};

    questions.forEach((question: any, index: number) => {
      const userAnswer = answers[question.id];
      userAnswers[question.id] = userAnswer;
      
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    submitQuizMutation.mutate({
      score: correctAnswers,
      totalQuestions: questions.length,
      answers: userAnswers,
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const selectAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  if (quizStarted && selectedQuiz) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedQuiz.title}</CardTitle>
              <div className="flex items-center gap-4">
                {timeLeft !== null && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
                <Badge variant="secondary">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            {quizCompleted ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {score >= questions.length * 0.7 ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                <p className="text-lg">
                  Your Score: <span className="font-bold text-blue-600">{score}/{questions.length}</span>
                </p>
                <p className="text-gray-600">
                  {score >= questions.length * 0.7 ? "Excellent work!" : "Keep practicing!"}
                </p>
                <Button onClick={() => {
                  setQuizStarted(false);
                  setSelectedQuiz(null);
                }}>
                  Back to Quizzes
                </Button>
              </div>
            ) : currentQ ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{currentQ.question}</h3>
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => selectAnswer(currentQ.id, value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="A" />
                    <Label htmlFor="A" className="flex-1 cursor-pointer p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                      A) {currentQ.optionA}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="B" />
                    <Label htmlFor="B" className="flex-1 cursor-pointer p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                      B) {currentQ.optionB}
                    </Label>
                  </div>
                  {currentQ.optionC && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id="C" />
                      <Label htmlFor="C" className="flex-1 cursor-pointer p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                        C) {currentQ.optionC}
                      </Label>
                    </div>
                  )}
                  {currentQ.optionD && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id="D" />
                      <Label htmlFor="D" className="flex-1 cursor-pointer p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                        D) {currentQ.optionD}
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={!answers[currentQ.id]}
                  >
                    {currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next Question"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
        {user?.isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Quiz Title" />
                <Textarea placeholder="Quiz Description" rows={3} />
                <Input type="number" placeholder="Time Limit (minutes)" />
                <Button className="w-full">Create Quiz</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz: any) => {
          const userAttempt = userAttempts.find((attempt: any) => attempt.quizId === quiz.id);
          const bestScore = userAttempt ? userAttempt.score : null;

          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{quiz.title}</span>
                  {bestScore !== null && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {bestScore}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {quiz.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  {quiz.timeLimit && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.timeLimit} min
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    Created {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => startQuiz(quiz)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {bestScore !== null ? "Retake Quiz" : "Start Quiz"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {quizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Quizzes Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new quizzes to test your knowledge!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}