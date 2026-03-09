import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve up production assets
app.use(express.static("dist"));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// If not in production, use port 5173 or the environment port
const PORT = process.env.PORT || 5173;
console.log(`Listening on port ${PORT}`);
app.listen(PORT);
