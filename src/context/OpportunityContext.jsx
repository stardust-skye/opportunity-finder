import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiRequest } from "../services/api.js";
import { listOpportunities, saveOpportunity } from "../services/opportunities.js";

const OpportunityContext = createContext(null);

export function OpportunityProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [publicState, setPublicState] = useState({ items: [], loading: true, error: "" });
  const [ownState, setOwnState] = useState({ items: [], loading: false, error: "", ownerId: null });
  const publicGeneration = useRef(0);
  const ownGeneration = useRef(0);

  const refreshPublic = useCallback(async () => {
    const current = ++publicGeneration.current;
    setPublicState((state) => ({ ...state, loading: true, error: "" }));
    try {
      const items = await listOpportunities("/api/opportunities");
      if (current === publicGeneration.current) setPublicState({ items, loading: false, error: "" });
    } catch (error) {
      if (current === publicGeneration.current) setPublicState({ items: [], loading: false, error: error.message });
    }
  }, []);

  const refreshOwn = useCallback(async () => {
    const current = ++ownGeneration.current;
    if (authLoading || user?.role !== "PROFESSOR") {
      setOwnState({ items: [], loading: false, error: "", ownerId: null });
      return;
    }
    setOwnState({ items: [], loading: true, error: "", ownerId: user.id });
    try {
      const items = await listOpportunities("/api/professor/opportunities", { sessionRequired: true });
      if (current === ownGeneration.current) setOwnState({ items, loading: false, error: "", ownerId: user.id });
    } catch (error) {
      if (current === ownGeneration.current) setOwnState({ items: [], loading: false, error: error.message, ownerId: user.id });
    }
  }, [authLoading, user?.id, user?.role]);

  useEffect(() => {
    refreshPublic();
    return () => { publicGeneration.current += 1; };
  }, [refreshPublic]);

  useEffect(() => {
    refreshOwn();
    return () => { ownGeneration.current += 1; };
  }, [refreshOwn]);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([refreshOwn(), refreshPublic()]);
  }, [refreshOwn, refreshPublic]);

  const createOpportunity = useCallback(async (input) => {
    await saveOpportunity(null, input);
    await refreshAfterMutation();
  }, [refreshAfterMutation]);
  const updateOpportunity = useCallback(async (id, input) => {
    await saveOpportunity(id, input);
    await refreshAfterMutation();
  }, [refreshAfterMutation]);
  const setOpportunityStatus = useCallback(async (id, status) => {
    await apiRequest(`/api/professor/opportunities/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: { status: status.toUpperCase() }, sessionRequired: true,
    });
    await refreshAfterMutation();
  }, [refreshAfterMutation]);
  const deleteOpportunity = useCallback(async (id) => {
    await apiRequest(`/api/professor/opportunities/${encodeURIComponent(id)}`, {
      method: "DELETE", body: {}, sessionRequired: true,
    });
    await refreshAfterMutation();
  }, [refreshAfterMutation]);

  const value = useMemo(() => ({
    opportunities: publicState.items,
    opportunitiesLoading: publicState.loading,
    opportunitiesError: publicState.error,
    refreshPublic,
    professorOpportunities: ownState.ownerId === user?.id ? ownState.items : [],
    professorLoading: ownState.loading || (user?.role === "PROFESSOR" && ownState.ownerId !== user.id),
    professorError: ownState.ownerId === user?.id ? ownState.error : "",
    refreshOwn,
    createOpportunity, updateOpportunity, deleteOpportunity, setOpportunityStatus,
  }), [publicState, ownState, user, refreshPublic, refreshOwn, createOpportunity, updateOpportunity, deleteOpportunity, setOpportunityStatus]);
  return <OpportunityContext.Provider value={value}>{children}</OpportunityContext.Provider>;
}

export function useOpportunities() {
  const context = useContext(OpportunityContext);
  if (!context) throw new Error("useOpportunities must be used within an OpportunityProvider.");
  return context;
}
