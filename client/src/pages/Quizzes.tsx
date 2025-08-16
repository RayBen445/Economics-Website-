import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { BookOpen, Clock, Trophy, Plus, Eye, Users } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  totalQuestions: number;
  createdAt: string;
  isActive: boolean;
}

export default function Quizzes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: { title: string; description: string; timeLimit: number }) => {
      const res = await apiRequest("POST", "/api/quizzes", quizData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const timeLimit = parseInt(formData.get("timeLimit") as string);

    createQuizMutation.mutate({ title, description, timeLimit });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-1">Test your knowledge with interactive quizzes</p>
          </div>
          
          {(user as User)?.isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-lautech-blue hover:bg-lautech-blue/90" data-testid="button-create-quiz">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                  <DialogDescription>
                    Create a new quiz for students to take
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter quiz title"
                      required
                      data-testid="input-quiz-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter quiz description"
                      required
                      data-testid="textarea-quiz-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      placeholder="30"
                      min="1"
                      max="180"
                      required
                      data-testid="input-quiz-time-limit"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel-quiz"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createQuizMutation.isPending}
                      data-testid="button-submit-quiz"
                    >
                      {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{quizzes?.length || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-lautech-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quizzes?.filter(q => q.isActive).length || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quizzes Grid */}
        {quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{quiz.title}</CardTitle>
                    <Badge variant={quiz.isActive ? "default" : "secondary"}>
                      {quiz.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {quiz.timeLimit} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {quiz.totalQuestions} questions
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-lautech-blue hover:bg-lautech-blue/90"
                        onClick={() => setSelectedQuiz(quiz)}
                        disabled={!quiz.isActive}
                        data-testid={`button-take-quiz-${quiz.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {quiz.isActive ? "Take Quiz" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
              <p className="text-gray-600 mb-4">
                {user?.isAdmin 
                  ? "Create your first quiz to get started" 
                  : "Check back later for new quizzes"}
              </p>
              {(user as User)?.isAdmin && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-lautech-blue hover:bg-lautech-blue/90"
                  data-testid="button-create-first-quiz"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz Details Modal */}
        {selectedQuiz && (
          <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedQuiz.title}</DialogTitle>
                <DialogDescription>
                  {selectedQuiz.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    Time Limit: {selectedQuiz.timeLimit} minutes
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    Questions: {selectedQuiz.totalQuestions}
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• You have {selectedQuiz.timeLimit} minutes to complete this quiz</li>
                    <li>• Once started, the timer cannot be paused</li>
                    <li>• Make sure you have a stable internet connection</li>
                    <li>• You can only take this quiz once</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuiz(null)}
                    data-testid="button-close-quiz-details"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-lautech-blue hover:bg-lautech-blue/90"
                    data-testid="button-start-quiz"
                  >
                    Start Quiz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}