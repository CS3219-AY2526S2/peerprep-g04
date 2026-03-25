import TextField from "@mui/material/TextField";
import { ToggleableTextField } from "../components/ToggleableTextField";
import Link from "@mui/material/Link";
import { useContext, useState } from "react";
import styles from './SignInForm.module.css';
import { UserContext } from "../hooks/useUserService";
import { Link as RouterLink, useNavigate } from 'react-router';
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";

export function SignInForm(props) {
  const { toggleForm } = props; 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { login, loading } = useContext(UserContext);

  async function submit(e) {
    e.preventDefault();
    const res = await login(email, password);
    if (res) navigate('/signed-in');
  }

  return (
    <Card title="Sign In" style={{ maxWidth: "500px", width: "100%" }}>
      <form onSubmit={submit} className={styles.form}>
        <TextField
          className={styles.inputField}
          label="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <ToggleableTextField 
          className={styles.inputField}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <PrimaryButton
          text={loading ? "Logging in..." : "Login"}
          type="submit"
          disabled={loading}
        />

      <p className={styles.text}>
        No account?{" "}
        <Link
          onClick={(e) => {
            e.preventDefault();
            toggleForm();
          }}
          className={styles.link}
        >
          Create
        </Link>
      </p>

      <p className={styles.text}>
        Forget password?{" "}
        <RouterLink to="/forget-password" className={styles.link}>
          Reset
        </RouterLink>
      </p>
      </form>
    </Card>
  );
}