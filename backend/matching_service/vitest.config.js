/// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    silent: false, // do not capture console.log
    threads: false,
    fileParallelism: false,
  },
});