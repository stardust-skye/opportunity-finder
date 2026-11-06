import { apiRequest, fetchAllPages } from "./api.js";

export function toOpportunity(item) {
  const deadline = item.deadline.slice(0, 10);
  const professor = item.professor.fullName;
  return {
    ...item,
    sourceLocation: item.location,
    sourceCommitment: item.commitment,
    sourceApplicationInstructions: item.applicationInstructions,
    deadline,
    deadlineLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${deadline}T00:00:00Z`)),
    postedAt: item.createdAt,
    eyebrow: item.department.split("·")[0].trim(),
    type: item.opportunityType,
    skills: item.requiredSkills,
    professor,
    role: "Professor",
    initials: professor.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    color: "coral",
    location: item.location || "Location not specified",
    commitment: item.commitment || "Contact professor for details",
    status: item.status.toLowerCase(),
    applicationHref: item.applicationUrl || `mailto:${encodeURIComponent(item.contactEmail)}?subject=${encodeURIComponent(item.title)}`,
    applicationInstructions: item.applicationInstructions || `Contact ${item.contactEmail} to ask about applying.`,
  };
}

export async function listOpportunities(path, options) {
  return (await fetchAllPages(path, options)).map(toOpportunity);
}

export async function getOpportunity(id, signal) {
  const response = await apiRequest(`/api/opportunities/${encodeURIComponent(id)}`, { signal });
  return toOpportunity(response.data);
}

export function saveOpportunity(id, input) {
  return apiRequest(id ? `/api/professor/opportunities/${encodeURIComponent(id)}` : "/api/professor/opportunities", {
    method: id ? "PUT" : "POST", body: input, sessionRequired: true,
  });
}
