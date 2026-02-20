import { useState } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
import { createContext } from "react";
import { useNavigate } from "react-router";

// Note: no url navigation in state hooks, only react components handle navigation.

const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_USER_SERVICE_API}`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

function getUser(resp_json) {
  return {
    user_id: resp_json.user_id,
    username: resp_json.username,
    email: resp_json.email,
    access: resp_json.access,
  }
}

export function useUserService() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [accessToken, setAccessToken] = useState();

  async function checkForAccessTokenAndLogin() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    
    try {
      const res = await api.get('/verify-token', {
        headers: {authorization: `Bearer ${accessToken}`},
      });
      setAccessToken(accessToken);
      setUser(getUser(res.data));
      return true;
    } catch (err) {
      toast('checkFoAccessTokenAndLogin ' + err.message);
      return false;
    }
  }

  async function login(email, password) {
    let out = false;
    setLoading(true);
    try {
      const res = await api.post('/login', {email, password});
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
      out = true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
    return out;
  }

  async function createUser(username, email, password) {
    let out = false;
    setLoading(true);
    try {
      const res = await api.post('/create-user', { username, email, password });
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
      out = true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
    return out;
  }

  async function forgetPassword(email) {
    setLoading(true);
    try {
      const res = await api.post(`forget-password/${email}`);
      toast(res.data.message);
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
  }

  async function resetPassword(token, userId, password) {
    setLoading(true);
    try {
      const res = await api.patch(`/update-user/${userId}`,{ password },
        {
          headers: {authorization: `Bearer ${token}`}
        }
      );
      toast('password reset successfully');
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
  }

  // obj may contain the following fields: username, email, password
  async function updateUser(obj) {
    setLoading(true);
    try {
      const res = await api.patch(
        `/update-user/${user.user_id}`, 
        obj,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
      );
      setUser(getUser(res.data));
      toast('User data updated successfully');
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('accessToken');
  }

  return {
    user, 
    loading,
    checkForAccessTokenAndLogin,
    login,
    createUser,
    forgetPassword,
    resetPassword,
    updateUser,
    logout
  }
}

export const UserContext = createContext();