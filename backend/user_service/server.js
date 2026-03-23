import { app } from "./src/app.js";
import { create_user, waitForDB } from "./src/database/db.js";

async function startServer() {
  await waitForDB();

  app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    create_user("tim", "tim@gmail.com", "abc", "admin").catch((err) =>
      console.log(err),
    );
    console.log(`listening on localhost:${process.env.PORT}`);
  });
}

app.get("/", (req, res) => {
  res.send("User service running");
});

startServer();
