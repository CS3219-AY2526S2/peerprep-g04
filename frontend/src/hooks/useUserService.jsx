import { useState } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
import { createContext } from "react";

const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_USER_SERVICE_API}`, 
  headers: {
    'Content-Type': 'application/json',
  },
});


function getUser(resp_json) {
  return {
    user_id: resp_json.id,
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
      setUser(getUser(res.data));
    } catch (err) {
      toast('checkFoAccessTokenAndLogin ' + err.message);
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await api.post('/login', {email, password});
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
  }

  async function createUser(username, email, password) {
    setLoading(true);
    try {
      const res = await api.post('/create-user', { username, email, password });
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message);
    }
    setLoading(false);
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

  return {
    user, 
    loading,
    checkForAccessTokenAndLogin,
    login,
    createUser,
    forgetPassword,
  }
}

export const UserContext = createContext();