import { defineConfig } from 'vite';

export default defineConfig({
    root: './src', // Define a pasta raiz como "src"
    build: {
        outDir: '../dist' // Saída para a pasta "dist"
    }
});
