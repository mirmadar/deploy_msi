import { useState, useEffect } from "react";
import { UsersApi } from "../../../api/users.api";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsersApi.list();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Ошибка при загрузке пользователей"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
  };
};


