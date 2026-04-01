import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router";
import { UserContext } from "../hooks/useUserService";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

export function Header({ onChange }) {
  const { user, logout } = useContext(UserContext);
  const [anchorElem, setAnchorElem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminOrOwner = user?.access !== "user";

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
      justifyContent: "space-between", // Pushes logo left and the nav-group right
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
      margin: 0, // Reset default h1 margins
    },
    navGroup: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem", // Space between tabs and avatar
    },
    tab: {
      fontFamily: "'DM Sans', sans-serif",
      textTransform: "none",
      fontWeight: 500,
      minWidth: "auto",
      px: 2,
    },
    avatar: {
      cursor: "pointer",
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
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

      <div style={styles.navGroup}>
        <Tabs value={tab} onChange={handleTabChange} sx={{ minHeight: 'unset' }}>
          <Tab label="Home" value={0} sx={styles.tab} />
          <Tab label="Match" value={1} sx={styles.tab} />

          {isAdminOrOwner && (
            <Tab
              label="Question Management"
              value={2}
              sx={styles.tab}
            />
          )}

          {isAdminOrOwner && (
            <Tab
              label="User Management"
              value={3}
              sx={styles.tab}
            />
          )}
        </Tabs>

        <Box>
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
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { setAnchorElem(null); navigate("/signed-in/account"); }}>
              Account
            </MenuItem>

            <MenuItem
              onClick={async () => {
                setAnchorElem(null);
                await logout();
                navigate("/");
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </div>
    </div>
  );
}