import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  readProfessorOpportunities,
  writeProfessorOpportunities,
} from "../data/opportunityStore.js";
import { opportunities as mockOpportunities } from "../data/opportunities.js";
import { useAuth } from "./AuthContext.jsx";

const OpportunityContext = createContext(null);

function loadProfessorOpportunities() {
  try {
    return { opportunities: readProfessorOpportunities(), error: "" };
  } catch (error) {
    console.error("Could not load professor opportunities from localStorage.", error);
    return {
      opportunities: [],
      error: "Saved opportunities could not be loaded. Clear the damaged saved data to continue.",
    };
  }
}

export function OpportunityProvider({ children }) {
  const [storedState, setStoredState] = useState(loadProfessorOpportunities);
  const { user } = useAuth();

  const requireManager = useCallback(() => {
    if (user?.role !== "Professor" || !user.verified) {
      throw new Error("A verified professor account is required to manage opportunities.");
    }
    if (storedState.error) throw new Error(storedState.error);
  }, [user, storedState.error]);

  const save = useCallback((nextOpportunities) => {
    writeProfessorOpportunities(nextOpportunities);
    setStoredState({ opportunities: nextOpportunities, error: "" });
  }, []);

  const createOpportunity = useCallback((opportunity) => {
    requireManager();
    const now = new Date();
    const createdOpportunity = {
      ...opportunity,
      ownerId: user.id,
      id: `professor-${crypto.randomUUID()}`,
      status: "open",
      postedAt: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
    };
    save([createdOpportunity, ...storedState.opportunities]);
    return createdOpportunity;
  }, [requireManager, save, storedState.opportunities, user]);

  const updateOpportunity = useCallback((id, updates) => {
    requireManager();
    const exists = storedState.opportunities.some((item) => item.id === id && item.ownerId === user.id);
    if (!exists) {
      return false;
    }

    save(
      storedState.opportunities.map((item) =>
        item.id === id && item.ownerId === user.id ? { ...item, ...updates, id, ownerId: user.id } : item,
      ),
    );
    return true;
  }, [requireManager, save, storedState.opportunities, user]);

  const deleteOpportunity = useCallback((id) => {
    requireManager();
    const exists = storedState.opportunities.some((item) => item.id === id && item.ownerId === user.id);
    if (!exists) {
      return false;
    }

    save(storedState.opportunities.filter((item) => item.id !== id || item.ownerId !== user.id));
    return true;
  }, [requireManager, save, storedState.opportunities, user]);

  const setOpportunityStatus = useCallback((id, status) => {
    if (status !== "open" && status !== "closed") {
      throw new Error(`Unsupported opportunity status: ${status}`);
    }

    return updateOpportunity(id, { status });
  }, [updateOpportunity]);

  useEffect(() => {
    function syncFromStorage(event) {
      if (event.key === null || event.key === "opportunity-finder-professor-opportunities") {
        setStoredState(loadProfessorOpportunities());
      }
    }

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const value = useMemo(() => ({
    opportunities: [...storedState.opportunities, ...mockOpportunities],
    professorOpportunities: user?.role === "Professor"
      ? storedState.opportunities.filter((item) => item.ownerId === user.id)
      : [],
    storageError: storedState.error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    setOpportunityStatus,
  }), [
    createOpportunity,
    deleteOpportunity,
    setOpportunityStatus,
    storedState,
    updateOpportunity,
    user,
  ]);

  return (
    <OpportunityContext.Provider value={value}>
      {children}
    </OpportunityContext.Provider>
  );
}

export function useOpportunities() {
  const context = useContext(OpportunityContext);
  if (!context) {
    throw new Error("useOpportunities must be used within an OpportunityProvider.");
  }
  return context;
}
