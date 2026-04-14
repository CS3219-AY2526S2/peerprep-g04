import { app } from "./src/app.js";
import { create_question_from_obj, connectWithRetry } from "./src/database/db.js";

async function insert_dummy_questions() {
    const seedQuestions = [
        // --- 1. Two Sum ---
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
                '### Constraints:',
                '* `2 <= nums.length <= 10^4`',
                '* `-10^9 <= nums[i] <= 10^9`',
                '* `-10^9 <= target <= 10^9`',
                '* **Only one valid answer exists.**'
            ].join('\n'),
            test_case: {
                input: '{"nums": [2,7,11,15], "target": 9}',
                expected_output: '[0, 1]'
            }
        },
        // --- 2. Number of Islands ---
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
                '### Constraints:',
                '* `m == grid.length`',
                '* `n == grid[i].length`',
                '* `1 <= m, n <= 300`',
                "* `grid[i][j]` is `'0'` or `'1'`."
            ].join('\n'),
            test_case: {
                input: '{"grid": [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]}',
                expected_output: '1'
            }
        },
        // --- 3. Trapping Rain Water ---
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
                '### Constraints:',
                '* `n == height.length`',
                '* `1 <= n <= 2 * 10^4`',
                '* `0 <= height[i] <= 10^5`'
            ].join('\n'),
            test_case: {
                input: '[0,1,0,2,1,0,1,3,2,1,2,1]',
                expected_output: '6'
            }
        },
        // --- 4. Valid Parentheses ---
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
                '### Constraints:',
                '* `1 <= s.length <= 10^4`',
                '* `s` consists of parentheses only `()[]{}`.'
            ].join('\n'),
            test_case: {
                input: '"()"',
                expected_output: 'true'
            }
        },
        // --- 5. Best Time to Buy and Sell Stock ---
        {
            title: 'Best Time to Buy and Sell Stock',
            difficulty: 'easy',
            tags: ['array', 'dynamic programming'],
            body: [
                '# 121. Best Time to Buy and Sell Stock',
                '',
                'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.',
                '',
                'You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.',
                '',
                'Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return `0`.',
                '',
                '### Example 1:',
                '> **Input:** `prices = [7,1,5,3,6,4]`  ',
                '> **Output:** `5`  ',
                '> **Explanation:** Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
                '',
                '### Constraints:',
                '* `1 <= prices.length <= 10^5`',
                '* `0 <= prices[i] <= 10^4`'
            ].join('\n'),
            test_case: {
                input: '[7,1,5,3,6,4]',
                expected_output: '5'
            }
        },
        // --- 6. Longest Substring Without Repeating Characters ---
        {
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'medium',
            tags: ['hash table', 'string', 'sliding window'],
            body: [
                '# 3. Longest Substring Without Repeating Characters',
                '',
                'Given a string `s`, find the length of the **longest substring** without repeating characters.',
                '',
                '### Example 1:',
                '> **Input:** `s = "abcabcbb"`  ',
                '> **Output:** `3`  ',
                '> **Explanation:** The answer is "abc", with the length of 3.',
                '',
                '### Constraints:',
                '* `0 <= s.length <= 5 * 10^4`',
                '* `s` consists of English letters, digits, symbols and spaces.'
            ].join('\n'),
            test_case: {
                input: '"abcabcbb"',
                expected_output: '3'
            }
        },
        // --- 7. Product of Array Except Self ---
        {
            title: 'Product of Array Except Self',
            difficulty: 'medium',
            tags: ['array', 'prefix sum'],
            body: [
                '# 238. Product of Array Except Self',
                '',
                'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.',
                '',
                'The product of any prefix or suffix of `nums` is **guaranteed** to fit in a **32-bit** integer.',
                '',
                'You must write an algorithm that runs in `O(n)` time and without using the division operation.',
                '',
                '### Example 1:',
                '> **Input:** `nums = [1,2,3,4]`  ',
                '> **Output:** `[24,12,8,6]`',
                '',
                '### Constraints:',
                '* `2 <= nums.length <= 10^5`',
                '* `-30 <= nums[i] <= 30`'
            ].join('\n'),
            test_case: {
                input: '[1,2,3,4]',
                expected_output: '[24, 12, 8, 6]'
            }
        },
        // --- 8. Coin Change ---
        {
            title: 'Coin Change',
            difficulty: 'medium',
            tags: ['array', 'dynamic programming', 'bfs'],
            body: [
                '# 322. Coin Change',
                '',
                'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.',
                '',
                'Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
                '',
                'You may assume that you have an infinite number of each kind of coin.',
                '',
                '### Example 1:',
                '> **Input:** `coins = [1,2,5]`, `amount = 11`  ',
                '> **Output:** `3`  ',
                '> **Explanation:** 11 = 5 + 5 + 1',
                '',
                '### Constraints:',
                '* `1 <= coins.length <= 12`',
                '* `1 <= coins[i] <= 2^31 - 1`',
                '* `0 <= amount <= 10^4`'
            ].join('\n'),
            test_case: {
                input: '{"coins": [1,2,5], "amount": 11}',
                expected_output: '3'
            }
        },
        // --- 9. Maximum Subarray ---
        {
            title: 'Maximum Subarray',
            difficulty: 'medium',
            tags: ['array', 'divide and conquer', 'dynamic programming'],
            body: [
                '# 53. Maximum Subarray',
                '',
                'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.',
                '',
                'A **subarray** is a contiguous part of an array.',
                '',
                '### Example 1:',
                '> **Input:** `nums = [-2,1,-3,4,-1,2,1,-5,4]`  ',
                '> **Output:** `6`  ',
                '> **Explanation:** [4,-1,2,1] has the largest sum = 6.',
                '',
                '### Constraints:',
                '* `1 <= nums.length <= 10^5`',
                '* `-10^4 <= nums[i] <= 10^4`'
            ].join('\n'),
            test_case: {
                input: '[-2,1,-3,4,-1,2,1,-5,4]',
                expected_output: '6'
            }
        },
        // --- 10. Valid Anagram ---
        {
            title: 'Valid Anagram',
            difficulty: 'easy',
            tags: ['hash table', 'string', 'sorting'],
            body: [
                '# 242. Valid Anagram',
                '',
                'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
                '',
                'An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
                '',
                '### Example 1:',
                '> **Input:** `s = "anagram"`, `t = "nagaram"`  ',
                '> **Output:** `true`',
                '',
                '### Constraints:',
                '* `1 <= s.length, t.length <= 5 * 10^4`',
                '* `s` and `t` consist of lowercase English letters.'
            ].join('\n'),
            test_case: {
                input: '{"s": "anagram", "t": "nagaram"}',
                expected_output: 'true'
            }
        },
        // --- 11. Merge Intervals ---
        {
            title: 'Merge Intervals',
            difficulty: 'medium',
            tags: ['array', 'sorting'],
            body: [
                '# 56. Merge Intervals',
                '',
                'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.',
                '',
                '### Example 1:',
                '> **Input:** `intervals = [[1,3],[2,6],[8,10],[15,18]]`  ',
                '> **Output:** `[[1,6],[8,10],[15,18]]`  ',
                '> **Explanation:** Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
                '',
                '### Constraints:',
                '* `1 <= intervals.length <= 10^4`',
                '* `intervals[i].length == 2`',
                '* `0 <= start_i <= end_i <= 10^4`'
            ].join('\n'),
            test_case: {
                input: '[[1,3],[2,6],[8,10],[15,18]]',
                expected_output: '[[1,6],[8,10],[15,18]]'
            }
        },
        // --- 12. Container With Most Water ---
        {
            title: 'Container With Most Water',
            difficulty: 'medium',
            tags: ['array', 'two pointers', 'greedy'],
            body: [
                '# 11. Container With Most Water',
                '',
                'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.',
                '',
                'Find two lines that together with the x-axis form a container, such that the container contains the most water.',
                '',
                'Return *the maximum amount of water a container can store*.',
                '',
                '### Example 1:',
                '> **Input:** `height = [1,8,6,2,5,4,8,3,7]`  ',
                '> **Output:** `49`  ',
                '> **Explanation:** The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.',
                '',
                '### Constraints:',
                '* `n == height.length`',
                '* `2 <= n <= 10^5`',
                '* `0 <= height[i] <= 10^4`'
            ].join('\n'),
            test_case: {
                input: '[1,8,6,2,5,4,8,3,7]',
                expected_output: '49'
            }
        }
    ];

    console.log("Seeding dummy questions to database...");
    for (const q of seedQuestions) {
        try {
            await create_question_from_obj(q);
            console.log(`Successfully inserted: ${q.title}`);
        } catch (err) {
            console.log(`Skipped ${q.title}: Already exists or error occurred.`); 
        }
    }
}

app.listen(process.env.PORT || 3000, async (err) => {
    if (err) console.log(err);

    await connectWithRetry().catch(err => {
        console.error("Failed to connect to Question DB:", err);
        process.exit(1);
    });

    console.log(`listening on localhost:${process.env.PORT || 3000}`);
    
    insert_dummy_questions();
});