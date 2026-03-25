import TextField from "@mui/material/TextField";
import { ToggleableTextField } from "../components/ToggleableTextField";
import Link from "@mui/material/Link";
import { useContext, useState } from "react";
import styles from './SignInForm.module.css';
import { UserContext } from "../hooks/useUserService";
import { useNavigate } from 'react-router';
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";

export function SignUpForm(props) {
  const { toggleForm } = props;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { loading, createUser } = useContext(UserContext); 

  async function submit(e) {
    e.preventDefault();
    const res = await createUser(username, email, password);
    if (res) navigate('/signed-in');
  }

  return (
    <Card title="Sign Up" style={{ maxWidth: "500px", width: "100%" }}>
      <form onSubmit={submit} className={styles.form}>
        <TextField
          className={styles.inputField}
          label="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />

        <TextField
          className={styles.inputField}
          label="Email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <ToggleableTextField
          className={styles.inputField}
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <PrimaryButton
          text={loading ? "Creating..." : "Create"}
          type="submit"
          disabled={loading}
        />

        <p className={styles.text}>
          Already have an account?{" "}
          <Link
            onClick={(e) => {
              e.preventDefault();
              toggleForm();
            }}
            className={styles.link}
          >
            Login
          </Link>
        </p>
      </form>
    </Card>
  );
}