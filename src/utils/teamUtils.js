/**
 * Utility to remove duplicate team members based on normalized name (case-insensitive & trimmed).
 * Retains the first occurrence of each unique team member name.
 */
export function removeDuplicateTeamMembers(members = []) {
  if (!Array.isArray(members)) return [];

  const seenNames = new Set();
  const uniqueMembers = [];

  for (const member of members) {
    if (!member) continue;
    const nameStr = typeof member === "string" ? member : member.name;
    if (!nameStr) continue;

    const normalized = nameStr.trim().toLowerCase();
    if (!seenNames.has(normalized)) {
      seenNames.add(normalized);
      uniqueMembers.push(member);
    }
  }

  return uniqueMembers;
}

/**
 * Calculates a team member's consecutive active daily completion streak from real tasks.
 * Returns 0 if no tasks have been completed recently.
 */
export function calculateMemberStreak(memberName, tasks = []) {
  if (!memberName || !Array.isArray(tasks)) return 0;

  const completedTasks = tasks.filter(
    t => t.assignedTo === memberName && t.status === "Completed"
  );

  if (completedTasks.length === 0) return 0;

  // Extract unique completion dates (formatted YYYY-MM-DD)
  const completionDates = new Set();
  completedTasks.forEach(t => {
    const rawDate = t.completedDate || t.dueDate || (t.createdAt && t.createdAt.split("T")[0]);
    if (rawDate && typeof rawDate === "string") {
      const dateOnly = rawDate.split("T")[0];
      completionDates.add(dateOnly);
    }
  });

  if (completionDates.size === 0) return 0;

  const formatDate = (d) => d.toISOString().split("T")[0];

  const checkDate = new Date();
  const todayStr = formatDate(checkDate);

  const yesterday = new Date(checkDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // If no task completed today or yesterday, streak is reset to 0
  if (!completionDates.has(todayStr) && !completionDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let currentCheck = completionDates.has(todayStr) ? checkDate : yesterday;

  while (completionDates.has(formatDate(currentCheck))) {
    streak++;
    currentCheck = new Date(currentCheck);
    currentCheck.setDate(currentCheck.getDate() - 1);
  }

  return streak;
}

