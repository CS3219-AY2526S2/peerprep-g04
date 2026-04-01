import { Outlet } from "react-router";
import { AiChatPage } from "../AiChat/AiChatPage.jsx";

export function SignedInPage() {
  return (
    <div style={{width: '100vw', position: 'relative', background: "#f8faff"}}>
      <Outlet />
      <AiChatPage />
    </div>
  )
}