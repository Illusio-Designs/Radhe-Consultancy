import React, { createContext, useContext, useState, useEffect } from "react";
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

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleAPI.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles");
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping data refresh");
      return;
    }

    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchRoles()]);
      setError(null);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch data when authentication is complete and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setUsers([]);
      setRoles([]);
    }
  }, [authLoading, isAuthenticated]);

  const value = {
    users,
    roles,
    loading,
    error,
    refreshData,
    fetchUsers,
    fetchRoles,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
