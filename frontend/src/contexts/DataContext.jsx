import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  startTransition,
  useCallback,
  useMemo,
} from "react";
import { userAPI, roleAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize fetch functions to prevent recreation
  const fetchUsers = useCallback(async () => {
    try {
      const data = await userAPI.getAllUsers();
      startTransition(() => {
        setUsers(data);
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      startTransition(() => {
        setError("Failed to fetch users");
      });
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await roleAPI.getAllRoles();
      startTransition(() => {
        setRoles(data);
      });
    } catch (err) {
      console.error("Error fetching roles:", err);
      startTransition(() => {
        setError("Failed to fetch roles");
      });
    }
  }, []);

  // Memoize refreshData function
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping data refresh");
      return;
    }

    startTransition(() => {
      setLoading(true);
    });

    try {
      await Promise.all([fetchUsers(), fetchRoles()]);
      startTransition(() => {
        setError(null);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error refreshing data:", err);
      startTransition(() => {
        setError("Failed to refresh data");
        setLoading(false);
      });
    }
  }, [isAuthenticated, fetchUsers, fetchRoles]);

  // Only fetch data when authentication is complete and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshData();
    } else if (!authLoading && !isAuthenticated) {
      startTransition(() => {
        setLoading(false);
        setUsers([]);
        setRoles([]);
      });
    }
  }, [authLoading, isAuthenticated, refreshData]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    users,
    roles,
    loading,
    error,
    refreshData,
    fetchUsers,
    fetchRoles,
  }), [users, roles, loading, error, refreshData, fetchUsers, fetchRoles]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
