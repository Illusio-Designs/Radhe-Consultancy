import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI, roleAPI } from "../services/api";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
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

  useEffect(() => {
    refreshData();
  }, []);

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
