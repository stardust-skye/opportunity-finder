const OPPORTUNITIES_STORAGE_KEY = "opportunity-finder-professor-opportunities";

export function readProfessorOpportunities() {
  const serialized = window.localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
  if (!serialized) {
    return [];
  }

  const opportunities = JSON.parse(serialized);
  if (!Array.isArray(opportunities)) {
    throw new Error("Saved professor opportunities are not in the expected format.");
  }

  return opportunities;
}

export function writeProfessorOpportunities(opportunities) {
  window.localStorage.setItem(
    OPPORTUNITIES_STORAGE_KEY,
    JSON.stringify(opportunities),
  );
}
