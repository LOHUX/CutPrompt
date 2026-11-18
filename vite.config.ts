import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/._*'],
  },
});
