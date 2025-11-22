"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function updateBookProgress(bookId: string, nextPage: number) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { totalPages: true },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  const safeValue = Number.isFinite(nextPage) ? Math.floor(nextPage) : 0;
  const clamped = Math.min(
    Math.max(safeValue, 0),
    Math.max(book.totalPages, 0)
  );

  const updated = await prisma.book.update({
    where: { id: bookId },
    data: { currentPage: clamped },
  });

  revalidatePath("/");
  return updated;
}

export async function addBookNote(bookId: string, content: string) {
  const text = content.trim();
  if (!text) {
    throw new Error("Note content is required");
  }

  const note = await prisma.note.create({
    data: {
      bookId,
      content: text,
    },
  });

  revalidatePath("/");
  return note;
}

export async function addBook(data: {
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
}) {
  const book = await prisma.book.create({
    data: {
      title: data.title.trim(),
      author: data.author.trim(),
      coverUrl: data.coverUrl.trim(),
      totalPages: data.totalPages,
      status: "READING",
    },
  });

  revalidatePath("/");
  return book;
}

