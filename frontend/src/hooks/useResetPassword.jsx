import { useParams } from "react-router";

export function useResetPassword() {
  const { token, userId } = useParams();
  console.log(token, userId);
  return {
    userId
  }
}