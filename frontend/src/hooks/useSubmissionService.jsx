import axios from "axios";
import { toast } from "react-toastify";

export const submission_api = axios.create({
  baseURL: `http://${import.meta.env.VITE_SUBMISSION_SERVICE_API}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function create_submission(submission_obj, token) {
  try {
    const res = await submission_api.post('/create-submission', submission_obj, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.submission;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message, { type: "error" });
    return undefined;
  }
}

export async function get_submission_history(questionId, token) {
  try {
    const res = await submission_api.get(`/get-submission-history/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.submissions || [];
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message, { type: "error" });
    return undefined;
  }
}