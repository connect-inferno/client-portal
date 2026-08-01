// Smart Automation Utility for Infernos Ledger

export function runSmartAutomation(tasks = [], ideas = [], notifications = []) {
  const todayStr = new Date().toISOString().split("T")[0];
  let updatedTasks = [...tasks];
  let newNotifications = [...notifications];
  let hasTaskChanges = false;
  let hasNotifChanges = false;

  // 1. Automatic Overdue Detection
  updatedTasks = updatedTasks.map(task => {
    if (task.status !== "Completed" && task.dueDate < todayStr && task.status !== "Overdue") {
      hasTaskChanges = true;
      const overdueTask = { ...task, status: "Overdue" };
      
      // Auto-generate overdue notification if not already present
      const alreadyNotified = newNotifications.some(
        n => n.message && n.message.includes(task.title) && n.type === "warning"
      );
      if (!alreadyNotified) {
        hasNotifChanges = true;
        newNotifications.unshift({
          id: `notif-overdue-${task.id}-${Date.now()}`,
          type: "warning",
          title: "Overdue Task Alert",
          message: `'${task.title}' assigned to ${task.assignedTo} is overdue!`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
      return overdueTask;
    }

    // Mark future vs pending according to date
    if (task.status === "Pending" && task.dueDate > todayStr) {
      hasTaskChanges = true;
      return { ...task, status: "Future" };
    }

    if (task.status === "Future" && task.dueDate <= todayStr) {
      hasTaskChanges = true;
      return { ...task, status: "Pending" };
    }

    return task;
  });

  // 2. Upcoming Deadlines Reminder Generation (Due Today)
  updatedTasks.forEach(task => {
    if (task.status === "Pending" && task.dueDate === todayStr) {
      const alreadyNotified = newNotifications.some(
        n => n.message && n.message.includes(task.title) && n.type === "info"
      );
      if (!alreadyNotified) {
        hasNotifChanges = true;
        newNotifications.unshift({
          id: `notif-today-${task.id}-${Date.now()}`,
          type: "info",
          title: "Upcoming Deadline Today",
          message: `'${task.title}' is due today at ${task.dueTime || "17:00"}.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  return {
    updatedTasks,
    newNotifications,
    hasTaskChanges,
    hasNotifChanges
  };
}
