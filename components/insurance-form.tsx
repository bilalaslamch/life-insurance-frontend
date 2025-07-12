"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FormData, formSchema } from "@/types/insurance";
import { Calculator, Users, DollarSign, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";

export function InsuranceForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      income: undefined,
      dependents: undefined,
      riskTolerance: undefined,
    },
  });

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<null | {
    recommendation: string;
    explanation: string;
  }>(null);

  async function handleSubmit(data: FormData) {
    setLoading(true);

    let riskTolerance: "Low" | "Medium" | "High" = "Medium";
    if (data.riskTolerance === "low") riskTolerance = "Low";
    else if (data.riskTolerance === "medium") riskTolerance = "Medium";
    else if (data.riskTolerance === "high") riskTolerance = "High";

    try {
      const response = await api.post<{
        recommendation: string;
        explanation: string;
      }>("/recommendation", {
        age: data.age,
        income: data.income,
        numberOfDependents: data.dependents,
        riskTolerance,
      });

      setRecommendation(response.data);
      toast.success("Recommendation generated!");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const message =
        axiosErr.response?.data?.message || "Failed to get recommendation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Personal Information
        </CardTitle>
        <CardDescription className="text-gray-600">
          Help us understand your situation to provide the best recommendation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span>Age</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your age"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dependents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Number of Dependents</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Annual Income</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your annual income"
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskTolerance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Risk Tolerance</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <SelectValue placeholder="Select your risk tolerance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        Low - I prefer guaranteed returns
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium - I&apos;m comfortable with some risk
                      </SelectItem>
                      <SelectItem value="high">
                        High - I&apos;m willing to take risks for higher returns
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Generating Recommendation..."
                : "Get My Recommendation"}
            </Button>
          </form>
        </Form>

        {recommendation && (
          <div className="mt-6 p-6 bg-green-100 border border-green-200 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Your Recommendation:
            </h3>
            <p className="text-lg text-green-800">
              {recommendation.recommendation}
            </p>
            <p className="text-sm text-green-700 mt-2">
              {recommendation.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
