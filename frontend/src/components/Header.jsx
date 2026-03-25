import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router";
import { UserContext } from "../hooks/useUserService";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export function Header({ onChange }) {
  const { user, logout } = useContext(UserContext);
  const [anchorElem, setAnchorElem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.access === "admin";

  const getTabFromPath = () => {
    const path = location.pathname;

    if (path.includes("match")) return 1;
    if (path.includes("question-management")) return 2;
    if (path.includes("user-management")) return 3;
    if (path === "/signed-in") return 0;

    return false;
  };

  const tab = getTabFromPath();

  const styles = {
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.5rem 1.5rem",
      borderBottom: "1px solid #e2e8f0",
      background: "white",
    },
    logo: {
      fontFamily: "'Playfair Display', serif",
      fontStyle: "italic",
      fontSize: "1.4rem",
      fontWeight: 800,
    
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    
      letterSpacing: "-0.02em",
    },
    tab: {
      fontFamily: "'DM Sans', sans-serif",
      textTransform: "none",
      fontWeight: 500,
    },
    avatar: {
      cursor: "pointer",
    },
  };

  function handleTabChange(e, val) {
    if (onChange) onChange(e, val);

    switch (val) {
      case 0:
        navigate("/signed-in");
        break;
      case 1:
        navigate("/signed-in/match");
        break;
      case 2:
        navigate("/signed-in/question-management");
        break;
      case 3:
        navigate("/signed-in/user-management");
        break;
      default:
        break;
    }
  }

  return (
    <div style={styles.header}>
      <h1 style={styles.logo}>PeerPrep</h1>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Home" value={0} sx={styles.tab} />
        <Tab label="Match" value={1} sx={styles.tab} />

        {isAdmin && (
          <Tab
            label="Question Management"
            value={2}
            sx={styles.tab}
          />
        )}

        {isAdmin && (
          <Tab
            label="User Management"
            value={3}
            sx={styles.tab}
          />
        )}
      </Tabs>

      <Avatar
        style={styles.avatar}
        onClick={(e) => setAnchorElem(e.currentTarget)}
      >
        {user?.username?.[0]?.toUpperCase()}
      </Avatar>

      <Menu
        anchorEl={anchorElem}
        open={Boolean(anchorElem)}
        onClose={() => setAnchorElem(null)}
      >
        <MenuItem onClick={() => navigate("/signed-in/account")}>
          Account
        </MenuItem>

        <MenuItem
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}