"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export interface FeedbackInput {
  rating: number;
  category: string;
  message: string;
  page?: string;
}

export async function submitFeedback(
  input: FeedbackInput
): Promise<{ success: boolean; error?: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }
  if (!input.message.trim() || input.message.trim().length < 5) {
    return { success: false, error: "Please write a message (min 5 characters)" };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.feedback.create({
    data: {
      userId,
      rating: input.rating,
      category: input.category,
      message: input.message.trim(),
      page: input.page ?? null,
    },
  });

  return { success: true };
}
