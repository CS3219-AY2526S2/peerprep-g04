import TextField from "@mui/material/TextField";
import styles from './ForgetPassword.module.css';
import { useContext, useState } from "react";
import { UserContext } from "../hooks/useUserService";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { useNavigate } from "react-router";

export function ForgetPassword() {
  const [input, setInput] = useState('');
  const { loading, forgetPassword } = useContext(UserContext);
  const navigate = useNavigate();

  async function submit(ev) {
    ev.preventDefault();
    await forgetPassword(input);
    setInput('');
  }

  return (
    <div className={styles.main}>
      <Card title="Forget Password" style={{ maxWidth: "500px", width: "100%" }}>
        <form onSubmit={submit} className={styles.form}>
          <TextField 
            type="email"
            label="Email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
          />

          <div className={styles.buttonRow}>
            <PrimaryButton
              text="Back"
              color="white"
              onClick={() => navigate('/')}
            />
            <PrimaryButton
              text={loading ? "Sending..." : "Send email"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}