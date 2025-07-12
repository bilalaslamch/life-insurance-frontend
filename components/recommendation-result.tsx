"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface RecommendationResultProps {
  recommendation: {
    type: string;
    amount: string;
    term: string;
    explanation: string;
  };
  onReset: () => void;
}

export function RecommendationResult({
  recommendation,
  onReset,
}: RecommendationResultProps) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Your Recommendation
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-blue-600">
              {recommendation.type} – {recommendation.amount} for{" "}
              {recommendation.term}
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                {recommendation.explanation}
              </p>
            </div>
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-200 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
