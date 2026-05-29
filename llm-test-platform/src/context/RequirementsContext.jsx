import { createContext, useContext, useEffect, useRef, useState } from "react";

const RequirementsContext = createContext(null);

export function RequirementsProvider({ children }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const pollingRef = useRef(null);

  const refreshData = async () => {
    const data = await fetchRequirements();
    return data;
  };

  const fetchRequirements = async () => {
    try {
      const res = await fetch("http://localhost:4000/requirements");
      const data = await res.json();

      setRequirements(data);

      const hasActive = data.some((req) =>
        (req.generations || []).some(
          (g) => g.status === "pending" || g.status === "generating",
        ),
      );

      setIsGenerating(hasActive);

      return data;
    } catch (err) {
      console.error("Failed to fetch requirements", err);
    }
  };

  const reloadRequirements = async () => {
    setLoading(true);
    const data = await fetchRequirements();
    setLoading(false);
    return data;
  };

  useEffect(() => {
    if (isGenerating && !pollingRef.current) {
      pollingRef.current = setInterval(fetchRequirements, 2000);
    }

    if (!isGenerating && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isGenerating]);

  // initial load
  useEffect(() => {
    reloadRequirements();
  }, []);

  return (
    <RequirementsContext.Provider
      value={{
        requirements,
        loading,
        reloadRequirements,
        refreshData,
        isGenerating,
      }}
    >
      {children}
    </RequirementsContext.Provider>
  );
}

export function useRequirements() {
  const ctx = useContext(RequirementsContext);
  if (!ctx) {
    throw new Error("useRequirements must be used inside RequirementsProvider");
  }
  return ctx;
}
