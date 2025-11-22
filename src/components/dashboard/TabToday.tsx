import { getTasks } from "@/app/actions/todo";
import { TaskPanel } from "@/components/dashboard/TaskPanel";

export default async function TabToday() {
  const tasks = await getTasks("TODAY");

  return <TaskPanel initialTasks={tasks} type="TODAY" title="Today" />;
}

