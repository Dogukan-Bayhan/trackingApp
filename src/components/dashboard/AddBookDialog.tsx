"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { addBook } from "@/app/actions/vault";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddBookDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !author.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        await addBook({
          title: title.trim(),
          author: author.trim(),
          coverUrl: coverUrl.trim() || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
          totalPages: parseInt(totalPages) || 300,
        });
        setTitle("");
        setAuthor("");
        setCoverUrl("");
        setTotalPages("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to add book:", error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-[0_15px_40px_rgba(6,182,212,0.35)] transition hover:opacity-90"
        >
          <Plus className="mr-2 size-4" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950/95 border-slate-800/70 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-50">
            Add New Book
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Track your reading progress and capture insights.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-title" className="text-slate-300">
              Title *
            </Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deep Work"
              className="border-slate-800 bg-slate-950/80 text-slate-100"
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-author" className="text-slate-300">
              Author *
            </Label>
            <Input
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Cal Newport"
              className="border-slate-800 bg-slate-950/80 text-slate-100"
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-pages" className="text-slate-300">
              Total Pages
            </Label>
            <Input
              id="book-pages"
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="300"
              className="border-slate-800 bg-slate-950/80 text-slate-100"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-cover" className="text-slate-300">
              Cover URL (optional)
            </Label>
            <Input
              id="book-cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="border-slate-800 bg-slate-950/80 text-slate-100"
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            >
              {isPending ? "Adding..." : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

