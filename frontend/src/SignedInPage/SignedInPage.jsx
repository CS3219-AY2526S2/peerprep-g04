import Typography from "@mui/material/Typography";
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import styles from './SignedInPage.module.css';
import { UserContext } from "../hooks/useUserService";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const labels = ['Home', 'Match', 'Questions', 'Account'];

export function SignedInPage() {
  const { user } = useContext(UserContext)
  const [idx, setIdx] = useState(labels.length - 1);

  function tabsChange(ev, val) {
    setIdx(val);
  }
  console.log(user?.access !== 'admin');
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>PeerPrep</Typography>
        <Tabs 
          value={idx}
          onChange={tabsChange}
        >
          <Tab label='Home' value={0}></Tab>
          <Tab label='Match' value={1}></Tab>
          <Tab label='Questions' value={2} disabled={user?.access !== 'admin'}></Tab>
          <Tab label='Account' value={3}></Tab>
        </Tabs>
        <Typography>{user?.username ?? 'undefined'}</Typography>
      </div>
      <div>hello world</div>
    </div>
  )
}