import { getTasks } from "@/app/actions/todo";
import { TaskPanel } from "@/components/dashboard/TaskPanel";

export default async function TabTomorrow() {
  const tasks = await getTasks("TOMORROW");

  return <TaskPanel initialTasks={tasks} type="TOMORROW" title="Tomorrow" />;
}

