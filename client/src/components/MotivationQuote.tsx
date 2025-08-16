import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function MotivationQuote() {
  const [currentQuote, setCurrentQuote] = useState<any>(null);

  const { data: quotes } = useQuery({
    queryKey: ['/api/quotes'],
  });

  const { data: randomQuote } = useQuery({
    queryKey: ['/api/quotes/random'],
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  useEffect(() => {
    if (randomQuote) {
      setCurrentQuote(randomQuote);
    }
  }, [randomQuote]);

  if (!currentQuote) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950 dark:to-amber-950 border-l-4 border-l-blue-600">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Quote className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 dark:text-gray-200 italic font-medium">
              "{currentQuote.quote}"
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-right">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}