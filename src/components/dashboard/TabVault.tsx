import { prisma } from "@/lib/prisma";
import { VaultBookCard } from "@/components/dashboard/VaultBookCard";
import { AddBookDialog } from "@/components/dashboard/AddBookDialog";
import { Progress } from "@/components/ui/progress";

const bentoShell =
  "rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_35px_120px_-45px_rgba(8,8,20,0.95)] backdrop-blur-2xl";

export default async function TabVault() {
  const [booksData, knowledgeEntriesData] = await Promise.all([
    prisma.book.findMany({
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.knowledgeBase.findMany({
      orderBy: { progress: "desc" },
    }),
  ]);

  const books = Array.isArray(booksData) ? booksData : [];
  const knowledgeEntries = Array.isArray(knowledgeEntriesData)
    ? knowledgeEntriesData
    : [];
  const experiments = knowledgeEntries.filter(
    (entry) => entry.type === "EXPERIMENT"
  );

  return (
    <div className="space-y-8">
      <section className={`${bentoShell}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Library
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Immersive Reading Sanctuary
            </h2>
            <p className="text-sm text-slate-400">
              Tap any cover to open notes, track progress, and capture insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-400">
              {books.length} Volumes
            </span>
            <AddBookDialog />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {books.length === 0 ? (
            <EmptyState message="The shelves are waiting. Seed the `Book` table to populate the Library." />
          ) : (
            books.map((book) => <VaultBookCard key={book.id} book={book} />)
          )}
        </div>
      </section>

      <section className={`${bentoShell}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Lab
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Experimental Knowledge Grid
            </h2>
            <p className="text-sm text-slate-400">
              Track living experiments & emerging skills from the
              `knowledge_base` table.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            {experiments.length} Experiments
          </span>
        </div>

        {experiments.length === 0 ? (
          <div className="mt-6">
            <EmptyState message='Log an experiment inside the `knowledge_base` table with type "EXPERIMENT" to visualize it here.' />
          </div>
        ) : (
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {experiments.map((experiment) => (
              <article
                key={experiment.id}
                className="mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {experiment.status || "IN PROGRESS"}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {experiment.title}
                    </h3>
                  </div>
                  <span className="rounded-xl bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {experiment.progress ?? 0}%
                  </span>
                </div>
                {experiment.notes ? (
                  <p className="mt-3 text-sm text-slate-400">
                    {experiment.notes}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No notes yet. Surface breakthroughs here.
                  </p>
                )}
                <div className="mt-4 space-y-1">
                  <Progress value={experiment.progress ?? 0} className="h-2" />
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Momentum Meter
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

