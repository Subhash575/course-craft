import { email, z } from "zod";

// User validation using zod:-
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  // zod not have `password`
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z]+$/, "Last name can only contain letters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
