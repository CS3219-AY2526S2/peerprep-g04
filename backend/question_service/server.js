import { app } from "./src/app.js";
import { create_question_from_obj, waitForDB } from "./src/database/db.js";

async function insert_dummy_questions() {
    const q1 = {
        title: 't1',
        difficulty: 'easy',
        tags: ['dp', 'array'],
        body: 'hello q1',
    };

    const q2 = {
        title: 't2',
        difficulty: 'hard',
        tags: ['pq', 'tree'],
        body: 'hello q2'
    }
    
    try {
        await create_question_from_obj(q1);
        await create_question_from_obj(q2);
    } catch (err) {}
    
}

async function startServer() {
  await waitForDB();

  app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    console.log(`listening on localhost:${process.env.PORT}`);
    insert_dummy_questions();
  });
}

startServer();