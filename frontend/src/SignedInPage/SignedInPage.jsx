import Typography from "@mui/material/Typography";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import styles from './SignedInPage.module.css';
import { UserContext } from "../hooks/useUserService";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { AccountPage } from "../AccountPage/AccountPage";

const states = Object.freeze({
  home: 0,
  match: 1,
  questions: 2,
})

export function SignedInPage() {
  const { user } = useContext(UserContext)
  const [idx, setIdx] = useState(3);

  function tabsChange(ev, val) {
    setIdx(val);
  }

  function getPage(state) {
    switch (state) {
      case states.account:
        return <AccountPage />
        break;
      
      default:
        return <div>Hello World {idx}</div>
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>PeerPrep</Typography>
        <Tabs 
          value={idx}
          onChange={tabsChange}
        >
          <Tab label='Home' value={states.home} />
          <Tab label='Match' value={states.match} />
          <Tab label='Questions' value={states.questions} disabled={user?.access !== 'admin'} />
        </Tabs>
        <Link to="../account">{user?.username}</Link>
      </div>
      {getPage(idx)}
    </div>
  )
}