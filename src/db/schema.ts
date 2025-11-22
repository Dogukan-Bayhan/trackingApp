import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const taskCategories = [
  "PROJECT",
  "LEETCODE",
  "SPORT",
  "STUDY",
] as const;

export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const tasks = sqliteTable("Task", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  isCompleted: integer("isCompleted", { mode: "boolean" })
    .notNull()
    .default(false),
  type: text("type", { enum: ["TODAY", "TOMORROW", "WEEK"] }).notNull(),
  category: text("category", { enum: taskCategories })
    .notNull()
    .default("PROJECT"),
  priority: text("priority", { enum: taskPriorities })
    .notNull()
    .default("MEDIUM"),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completedAt"),
});

export const leetcodeMetrics = sqliteTable("leetcode_metrics", {
  id: text("id").primaryKey().notNull(),
  topicName: text("topicName").notNull(),
  totalProblems: integer("totalProblems").notNull(),
  solvedProblems: integer("solvedProblems").notNull(),
  difficultyLevel: text("difficultyLevel").notNull(),
});

export const knowledgeBase = sqliteTable("knowledge_base", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  type: text("type", { enum: ["BOOK", "EXPERIMENT"] }).notNull(),
  status: text("status").notNull(),
  coverUrl: text("coverUrl"),
  notes: text("notes"),
  progress: integer("progress").notNull().default(0),
});

export const userActivityLog = sqliteTable("user_activity_log", {
  id: text("id").primaryKey().notNull(),
  date: text("date").notNull().unique(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

