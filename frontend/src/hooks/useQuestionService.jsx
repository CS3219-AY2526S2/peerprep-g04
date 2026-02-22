import axios from "axios";
import { toast } from "react-toastify";

const question_api = axios.create({
  baseURL: `http://${import.meta.env.VITE_QUESTION_SERVICE_API}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// all methods here return a truthy value if successful, else a falsy value.
export async function get_question_by_id(id) {
  try {
    const res = await question_api.get(`/get-question-by-id/${id}`);
    return res.data;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message);
    return undefined;
  }
}

// return the questions array;
export async function get_all_questions_without_body() {
  try {
    const res = await question_api.get('/get-all-questions-without-body');
    return res.data.questions;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message);
    return undefined;
  }
}

// question_obj must have { title: string, difficulty: string, tags: string[], body: string }.
export async function create_question(question_obj) {
  try {
    const res = await question_api.post('/create-question' , question_obj);
    toast('question successfully created');
    return res.data.id;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message);
    return undefined;
  }
}

// question obj must have at least 1 field in { title: string, difficulty: string, tags: string[], body: string}
export async function update_question(id, question_obj) {
  try {
    const res = await question_api.patch(`/update-question/${id}`, question_obj);
    toast('question successfull updated');
    return true;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message);
    return false;
  }
}

export async function delete_question(id) {
  try {
    const res = await question_api.delete(`/delete-question/${id}`);
    toast('question successfully deleted');
    return true;
  } catch (err) {
    toast(err?.response?.data?.message ?? err.message);
    return false;
  }
}