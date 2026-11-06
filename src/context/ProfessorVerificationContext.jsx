import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "opportunity-finder-professor-verified";
const ProfessorVerificationContext = createContext(null);

function getInitialVerification() {
  try {
    return {
      isVerified: window.localStorage.getItem(STORAGE_KEY) === "true",
      error: "",
    };
  } catch (error) {
    console.error("Could not read the mock professor verification state.", error);
    return {
      isVerified: false,
      error: "The mock verification preview could not be loaded from this browser.",
    };
  }
}

export function ProfessorVerificationProvider({ children }) {
  const [state, setState] = useState(getInitialVerification);

  const setVerificationStatus = useCallback((verified) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(verified));
      setState({ isVerified: verified, error: "" });
    } catch (error) {
      console.error("Could not save the mock professor verification state.", error);
      throw new Error("Your verification preview could not be saved in this browser.");
    }
  }, []);

  useEffect(() => {
    function syncFromStorage(event) {
      if (event.key === null || event.key === STORAGE_KEY) {
        setState(getInitialVerification());
      }
    }

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const value = useMemo(
    () => ({
      isVerified: state.isVerified,
      verificationError: state.error,
      setVerificationStatus,
    }),
    [setVerificationStatus, state],
  );

  return (
    <ProfessorVerificationContext.Provider value={value}>
      {children}
    </ProfessorVerificationContext.Provider>
  );
}

export function useProfessorVerification() {
  const context = useContext(ProfessorVerificationContext);
  if (!context) {
    throw new Error(
      "useProfessorVerification must be used within a ProfessorVerificationProvider.",
    );
  }
  return context;
}
