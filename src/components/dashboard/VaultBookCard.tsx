"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Book, Note } from "@prisma/client";

import { addBookNote, updateBookProgress } from "@/app/actions/vault";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookWithNotes = Book & { notes: Note[] };

interface VaultBookCardProps {
  book: BookWithNotes;
}

export function VaultBookCard({ book }: VaultBookCardProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(book.currentPage);
  const [pageInput, setPageInput] = useState(book.currentPage.toString());
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(book.notes);
  const [isPending, startTransition] = useTransition();
  const [isNotePending, startNoteTransition] = useTransition();

  const statusLabel = useMemo(() => {
    if (!book.status) return "reading";
    return book.status.replace(/_/g, " ").toLowerCase();
  }, [book.status]);

  const progressValue = useMemo(() => {
    if (book.totalPages <= 0) return 0;
    return Math.min(
      100,
      Math.round((currentPage / book.totalPages) * 100)
    );
  }, [book.totalPages, currentPage]);

  const posterStyles = {
    backgroundImage: `linear-gradient(180deg, rgba(8,15,28,0.15) 0%, rgba(8,15,28,0.8) 100%), url(${book.coverUrl})`,
  };

  const handleProgressSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = Number(pageInput);
    if (!Number.isFinite(nextValue)) {
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updateBookProgress(book.id, nextValue);
        setCurrentPage(updated.currentPage);
        setPageInput(updated.currentPage.toString());
      } finally {
        router.refresh();
      }
    });
  };

  const handleNoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteText.trim()) {
      return;
    }

    startNoteTransition(async () => {
      try {
        const newNote = await addBookNote(book.id, noteText.trim());
        setNotes((prev) => [newNote, ...prev]);
        setNoteText("");
      } finally {
        router.refresh();
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="group relative flex h-72 w-44 overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1325] shadow-[0_20px_60px_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-2 hover:shadow-cyan-500/30 focus-visible:outline focus-visible:outline-amber-400"
          style={posterStyles}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/90" />
          <div className="relative mt-auto w-full p-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-300">
              {statusLabel}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-50 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-slate-300">{book.author}</p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-slate-950/95 border-slate-800/70 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-50">
            {book.title}
          </DialogTitle>
          <p className="text-sm text-slate-400">{book.author}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Progress
            </p>
            <div className="mt-3 rounded-xl bg-slate-900/60 p-4 shadow-inner shadow-black/40">
              <Progress
                value={progressValue}
                className="bg-slate-800 h-3 rounded-full"
              />
              <p className="mt-2 text-sm text-slate-300">
                {currentPage} / {book.totalPages} pages read
              </p>
            </div>
          </div>

          <form
            className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4"
            onSubmit={handleProgressSubmit}
          >
            <Label htmlFor={`progress-${book.id}`} className="text-slate-300">
              Update progress
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Input
                id={`progress-${book.id}`}
                type="number"
                min={0}
                max={book.totalPages}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                className="border-slate-800 bg-slate-950/80 text-slate-100"
                disabled={isPending}
              />
              <Button
                type="submit"
                disabled={isPending}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                Save
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
            <p className="text-sm font-medium text-slate-200">Notes</p>
            <ScrollArea className="mt-3 h-32 pr-3">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No notes yet. Create the first insight.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-200">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-slate-800/60 bg-slate-950/70 px-3 py-2"
                    >
                      {note.content}
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>

            <form className="mt-4 space-y-2" onSubmit={handleNoteSubmit}>
              <Label htmlFor={`note-${book.id}`} className="text-slate-300">
                Add note
              </Label>
              <Textarea
                id={`note-${book.id}`}
                rows={3}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="What did you learn?"
                className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-500"
                disabled={isNotePending}
              />
              <Button
                type="submit"
                disabled={isNotePending}
                className={cn(
                  "w-full bg-amber-400/90 text-slate-950 hover:bg-amber-300"
                )}
              >
                Save note
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

