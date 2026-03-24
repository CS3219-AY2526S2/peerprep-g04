import { useEffect, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

import MDEditor from "@uiw/react-md-editor";

import { PrimaryButton } from "../components/PrimaryButton";
import { update_question } from "../hooks/useQuestionService";
import { toast } from "react-toastify";

export function UpdateQuestionDialog({
  open,
  onClose,
  accessToken,
  question,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setTitle(question.title || "");
      setDifficulty(question.difficulty || "easy");
      setTags(question.tags || []);
      setBody(question.body || "");
    }
  }, [question]);

  function addTag(t) {
    setTags([...tags, t]);
    setTag("");
  }

  function deleteTag(t) {
    return () => setTags(tags.filter((x) => x !== t));
  }

  function hasChanges() {
    if (!question) return false;

    return (
      title !== question.title ||
      difficulty !== question.difficulty ||
      body !== question.body ||
      JSON.stringify(tags) !== JSON.stringify(question.tags)
    );
  }

  async function handleUpdate() {
    if (!hasChanges()) return;

    setLoading(true);
    const res = await update_question(
      question.id,
      { title, difficulty, tags, body },
      accessToken
    );
    setLoading(false);

    if (res) {
      onSuccess?.();
      handleClose();
    } else {
      toast("Update failed");
    }
  }

  function handleClose() {
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "90vw",
          maxWidth: 900,
          minWidth: 320,
        },
      }}
    >
      <DialogTitle
        style={{
          fontFamily: "'DM Sans', sans-serif",
          textAlign: "center",
        }}
      >
        Update Question
      </DialogTitle>

      <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {tags.map((t) => (
                <Chip key={t} label={t} onDelete={deleteTag(t)} />
              ))}
            </div>

            <div style={{ display: "flex" }}>
              <TextField
                size="small"
                fullWidth
                value={tag}
                label="Add tag"
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tag) {
                    e.preventDefault();
                    addTag(tag);
                  }
                }}
              />

              <IconButton onClick={() => tag && addTag(tag)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div data-color-mode="light">
            <MDEditor value={body} onChange={setBody} height={300} />
          </div>
        </div>
      </DialogContent>

      <DialogActions style={{ padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "0.75rem",
          }}
        >
          <PrimaryButton
            text="Cancel"
            color="white"
            fullWidth
            onClick={handleClose}
          />

          <PrimaryButton
            text={loading ? "Updating..." : "Update"}
            color="blue"
            fullWidth
            onClick={handleUpdate}
            disabled={loading || !hasChanges()}
          />
        </div>
      </DialogActions>
    </Dialog>
  );
}