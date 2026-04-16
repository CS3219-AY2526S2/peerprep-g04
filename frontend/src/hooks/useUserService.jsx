import { useState } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
import { createContext } from "react";

// Note: no url navigation in state hooks, only react components handle navigation.

const user_api = axios.create({
  baseURL: `http://${import.meta.env.VITE_USER_SERVICE_API}`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function get_all_users(token) {
  if (!token) return;
  try {
    const res = await user_api.get('/get-all-users', { headers: { authorization: `Bearer ${token}` } });
    return res.data.users;
  } catch (err) {
    toast(err?.response?.data?.message || err.message, { type: 'error' });
    return undefined;
  }
}

export async function get_user_by_id(id, token) {
  if (!token) return;
  try {
    const res = await user_api.get(`/get-user-by-id/${id}`, { headers: { authorization: `Bearer ${token}` } });
    return res.data.user;
  } catch (err) {
    toast(err?.response?.data?.message || err.message, { type: 'error' });
    return undefined;
  }
}

export async function external_update_user(id, user, token) {
  try {
    const res = await user_api.patch(`/update-user/${id}`, user, { headers: { authorization: `Bearer ${token}` } });
    toast('user updated successfully');
    return true;
  } catch (err) {
    toast(err?.response?.data?.message || err.message, { type: 'error' });
    return false;
  }
}

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
      const res = await user_api.get('/verify-token', {
        headers: {authorization: `Bearer ${accessToken}`},
      });
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
      return true;
    } catch (err) {
      toast('checkForAccessTokenAndLogin ' + err.message);
      return false;
    }
  }

  async function login(email, password) {
    let out = false;
    setLoading(true);
    try {
      const res = await user_api.post('/login', {email, password});
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
      out = true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
    }
    setLoading(false);
    return out;
  }

  async function createUser(username, email, password) {
    let out = false;
    setLoading(true);
    try {
      const res = await user_api.post('/create-user', { username, email, password });
      localStorage.setItem('accessToken', res.data.access_token);
      setAccessToken(res.data.access_token);
      setUser(getUser(res.data));
      out = true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
    }
    setLoading(false);
    return out;
  }

  async function forgetPassword(email) {
    setLoading(true);
    try {
      const res = await user_api.post(`forget-password/${email}`);
      toast(res.data.message);
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
    }
    setLoading(false);
  }

  async function resetPassword(token, userId, password) {
    let out = false;
    setLoading(true);
    try {
      const res = await user_api.patch(`/update-user/${userId}`,{ password },
        {
          headers: {authorization: `Bearer ${token}`}
        }
      );
      toast('password reset successfully');
      out = true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
    }
    setLoading(false);
    return out;
  }

  // obj may contain the following fields: username, email, password
  async function updateUser(obj) {
    setLoading(true);
    try {
      const res = await user_api.patch(
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
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
    }
    setLoading(false);
  }

  async function deleteUser(user_id) {
    try {
      const res = await user_api.delete(
        `/delete-user/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      toast('User deleted successfully');
      return true;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
      return false;
    }
  }

  async function createSubmission(submissionData) {
    try {
      const res = await user_api.post('/create-submission', submissionData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast('Submission created successfully');
      return res.data.submission;
    } catch (err) {
      toast(err?.response?.data?.message ?? err.message, { type: 'error' });
      return null;
    }
  }
  
  async function get_question_attempts(questionId) {
    try {
      const res = await user_api.get(`/get-submission-history/${questionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.data.submissions;
    } catch (err) {
      console.error("Failed to fetch history:", err);
      return [];
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('accessToken');
  }

  return {
    user, 
    accessToken,
    loading,
    setUser,
    checkForAccessTokenAndLogin,
    login,
    createUser,
    forgetPassword,
    resetPassword,
    updateUser,
    deleteUser,
    createSubmission,
    get_question_attempts,
    logout
  }
}

export const UserContext = createContext();