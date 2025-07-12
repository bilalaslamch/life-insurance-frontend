// src/types/insurance.ts

import { z } from "zod";

export const formSchema = z.object({
  age: z
    .number({ error: "Please enter your age" })
    .min(18, "Age must be at least 18")
    .max(80, "Age must be less than 80"),
  income: z
    .number({ error: "Please enter your income." })
    .min(1, "Income must be greater than 0"),
  dependents: z
    .number({ error: "Please enter number of dependents." })
    .min(0, "Number of dependents cannot be negative")
    .max(20, "Please enter a reasonable number"),
  riskTolerance: z.enum(["low", "medium", "high"], {
    error: "Please select your risk tolerance.",
  }),
});

export type FormData = z.infer<typeof formSchema>;
