import { getTasks } from "@/app/actions/todo";
import { TaskPanel } from "@/components/dashboard/TaskPanel";

export default async function TabWeek() {
  const tasks = await getTasks("WEEK");

  return <TaskPanel initialTasks={tasks} type="WEEK" title="This Week" />;
}

