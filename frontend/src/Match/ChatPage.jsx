import styles from "./ChatPage.module.css";
import Draggable from "react-draggable";
import { useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export function ChatPage(props) {
  const { user, messages, sendMessage, open = true } = props;
  const ref = useRef();
  const [message, setMessage] = useState("");

  return (
    <Draggable bounds="parent" cancel=".no-drag" nodeRef={ref}>
      <div
        ref={ref}
        className={`${styles.main} ${open ? styles.open : styles.closed}`}
      >
        <div className={styles.chatCtn}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.username === user.username ? styles.you : styles.other
              }
            >
              <div className={styles.header}>
                {msg.username === user.username ? "You" : msg.username}
              </div>
              <div>{msg.message}</div>
            </div>
          ))}
        </div>

        <div className={`${styles.gutter} no-drag`}>
          <TextField
            fullWidth
            size="small"
            multiline
            placeholder="Type a message..."
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
          />
          <Button
            variant="outlined"
            onClick={(ev) => {
              setMessage("");
              sendMessage(message);
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </Draggable>
  );
}
