import { app } from "./src/app.js";
import { create_question_from_obj, connectWithRetry } from "./src/database/db.js";

async function insert_dummy_questions() {
    const seedQuestions = [
        {
            title: 'Two Sum',
            difficulty: 'easy',
            tags: ['array', 'hash table'],
            body: [
                '# 1. Two Sum',
                '',
                'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.',
                '',
                'You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.',
                '',
                'You can return the answer in any order.',
                '',
                '### Example 1:',
                '> **Input:** `nums = [2,7,11,15]`, `target = 9`  ',
                '> **Output:** `[0,1]`  ',
                '> **Explanation:** Because `nums[0] + nums[1] == 9`, we return `[0, 1]`.',
                '',
                '### Example 2:',
                '> **Input:** `nums = [3,2,4]`, `target = 6`  ',
                '> **Output:** `[1,2]`',
                '',
                '### Constraints:',
                '* `2 <= nums.length <= 10^4`',
                '* `-10^9 <= nums[i] <= 10^9`',
                '* `-10^9 <= target <= 10^9`',
                '* **Only one valid answer exists.**'
            ].join('\n')
        },
        {
            title: 'Number of Islands',
            difficulty: 'medium',
            tags: ['array', 'dfs', 'bfs', 'matrix'],
            body: [
                '# 200. Number of Islands',
                '',
                "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*.",
                '',
                'An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
                '',
                '### Example 1:',
                '> **Input:** grid = [',
                '>   ["1","1","1","1","0"],',
                '>   ["1","1","0","1","0"],',
                '>   ["1","1","0","0","0"],',
                '>   ["0","0","0","0","0"]',
                '> ]  ',
                '> **Output:** `1`',
                '',
                '### Example 2:',
                '> **Input:** grid = [',
                '>   ["1","1","0","0","0"],',
                '>   ["1","1","0","0","0"],',
                '>   ["0","0","1","0","0"],',
                '>   ["0","0","0","1","1"]',
                '> ]  ',
                '> **Output:** `3`',
                '',
                '### Constraints:',
                '* `m == grid.length`',
                '* `n == grid[i].length`',
                '* `1 <= m, n <= 300`',
                "* `grid[i][j]` is `'0'` or `'1'`."
            ].join('\n')
        },
        {
            title: 'Trapping Rain Water',
            difficulty: 'hard',
            tags: ['array', 'two pointers', 'dp', 'stack'],
            body: [
                '# 42. Trapping Rain Water',
                '',
                'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
                '',
                '### Example 1:',
                '> **Input:** `height = [0,1,0,2,1,0,1,3,2,1,2,1]`  ',
                '> **Output:** `6`  ',
                '> **Explanation:** The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.',
                '',
                '### Example 2:',
                '> **Input:** `height = [4,2,0,3,2,5]`  ',
                '> **Output:** `9`',
                '',
                '### Constraints:',
                '* `n == height.length`',
                '* `1 <= n <= 2 * 10^4`',
                '* `0 <= height[i] <= 10^5`'
            ].join('\n')
        },
        {
            title: 'Valid Parentheses',
            difficulty: 'easy',
            tags: ['string', 'stack'],
            body: [
                '# 20. Valid Parentheses',
                '',
                'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
                '',
                'An input string is valid if:',
                '1. Open brackets must be closed by the same type of brackets.',
                '2. Open brackets must be closed in the correct order.',
                '3. Every close bracket has a corresponding open bracket of the same type.',
                '',
                '### Example 1:',
                '> **Input:** `s = "()"`  ',
                '> **Output:** `true`',
                '',
                '### Example 2:',
                '> **Input:** `s = "()[]{}"`  ',
                '> **Output:** `true`',
                '',
                '### Example 3:',
                '> **Input:** `s = "(]"`  ',
                '> **Output:** `false`',
                '',
                '### Constraints:',
                '* `1 <= s.length <= 10^4`',
                '* `s` consists of parentheses only `' + "`()[]{}`."
            ].join('\n')
        }
    ];

    console.log("Seeding dummy questions to database...");
    for (const q of seedQuestions) {
        try {
            await create_question_from_obj(q);
        } catch (err) {
            console.log(`Skipped ${q.title}: Already exists.`); 
        }
    }
}

app.listen(process.env.PORT, async (err) => {
    if (err) console.log(err);

    await connectWithRetry().catch(err => {
        console.error("Failed to connect to Question DB:", err);
        process.exit(1);
    });

    console.log(`listening on localhost:${process.env.PORT}`);
    
    insert_dummy_questions();
});