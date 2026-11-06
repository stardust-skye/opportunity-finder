const DAY_MS = 24 * 60 * 60 * 1000;
const CLOSING_SOON_DAYS = 14;
const NEW_DAYS = 14;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Returns a small status badge for an opportunity card, or null when none applies.
// Deadline status wins over "new" because it is more urgent for students.
export function getCardBadge(opportunity, today = new Date()) {
  const now = startOfDay(today);

  if (opportunity.deadline) {
    const daysLeft = Math.round((parseDate(opportunity.deadline) - now) / DAY_MS);

    if (daysLeft < 0) {
      return { tone: "closed", label: "Closed" };
    }
    if (daysLeft === 0) {
      return { tone: "urgent", label: "Closes today" };
    }
    if (daysLeft <= CLOSING_SOON_DAYS) {
      return { tone: "urgent", label: `Closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` };
    }
  }

  if (opportunity.postedAt) {
    const daysSincePosted = Math.round((now - parseDate(opportunity.postedAt)) / DAY_MS);
    if (daysSincePosted >= 0 && daysSincePosted <= NEW_DAYS) {
      return { tone: "new", label: "New" };
    }
  }

  return null;
}