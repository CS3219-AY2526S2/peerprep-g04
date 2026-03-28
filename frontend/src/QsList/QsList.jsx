import { useState, useEffect, useContext } from "react";
import {
  delete_question,
  get_all_questions_without_body,
} from "../hooks/useQuestionService";
import styles from "./QsList.module.css";

import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useOutletContext } from "react-router";
import { UserContext } from "../hooks/useUserService";

import { CreateQuestionDialog } from "./CreateQuestionDialog";
import { UpdateQuestionDialog } from "./UpdateQuestionDialog";

import { DeleteDialog } from "../components/DeleteDialog";
import { PrimaryButton } from "../components/PrimaryButton";
import { Table } from "../components/Table";

const getDifficultyColor = (d) => {
  if (d === "easy") return "green";
  if (d === "medium") return "orange";
  if (d === "hard") return "red";
  return undefined;
};

export function QsList() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { reload, setReload } = useOutletContext();
  const { accessToken } = useContext(UserContext);

  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    get_all_questions_without_body().then((data) => {
      if (data) setQuestions(data);
    });
  }, [reload]);

  const confirmDelete = async () => {
    if (!selectedQuestionId) return;

    setLoadingDelete(true);
    await delete_question(selectedQuestionId, accessToken);
    setReload((r) => !r);
    setLoadingDelete(false);
    handleCloseDelete();
  };

  const filteredQuestions = questions.filter((q) => {
    const s = search.toLowerCase();

    const matchesSearch =
      q.title.toLowerCase().includes(s) ||
      (q.tags || []).some((tag) => tag.toLowerCase().includes(s));

    const matchesDifficulty =
      difficultyFilter === "all" || q.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Questions</h1>

      <div className={styles.header}>
        <div className={styles.filters}>
          <TextField
            label="Search"
            placeholder="Search by title or tag..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />

          <TextField
            label="Difficulty"
            select
            size="small"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
        </div>

          <PrimaryButton
            text="Create"
            color="blue"
            fullWidth={false}
            onClick={() => setOpenCreate(true)}
          />
      </div>

      <Table emptyMessage="No questions found." style={{ width: "100%" }}>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>title</th>
              <th>difficulty</th>
              <th>tags</th>
              <th>&nbsp;</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>

                <td>{q.title}</td>

                <td style={{ color: getDifficultyColor(q.difficulty) }}>
                  {q.difficulty}
                </td>

                <td>
                  <div className={styles.tags}>
                    {q.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    ))}
                  </div>
                </td>

                <td>
                  <div className={styles.actions}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setOpenUpdate(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setOpenDelete(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>

      <CreateQuestionDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        accessToken={accessToken}
        onSuccess={() => setReload(v => !v)}
      />

      <UpdateQuestionDialog
        open={openUpdate && !!selectedQuestionId}
        onClose={() => {
          setOpenUpdate(false);
          setSelectedQuestionId(null);
        }}
        accessToken={accessToken}
        questionId={selectedQuestionId}
        onSuccess={() => setReload((v) => !v)}
      />

      <DeleteDialog
        open={openDelete && !!selectedQuestionId}
        onClose={() => {
          setOpenDelete(false);
          setSelectedQuestionId(null);
        }}
        onConfirm={confirmDelete}
        loading={loadingDelete}
      />
    </div>
  );
}