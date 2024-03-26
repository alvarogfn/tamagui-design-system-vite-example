import { PluginOption, defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

// Caminho absoluto do diretório atual a partir da raiz do sistema de arquivos.
const __dirname = dirname(fileURLToPath(import.meta.url)); // /home/user/pasta/library ou C:\Users\user\pasta\library

const computeAllSrcFiles = (): Record<string, string> => {
  // Encontra todos os arquivos .ts e .tsx dentro da pasta src.
  const files = glob.sync(["src/**/*.{ts,tsx}"], {
    ignore: ["src/**/*.stories.tsx", "src/**/*.test.tsx", "src/setup-tests.ts"],
  });

  const paths = files.map((file) => [
    // Remove a extensão do arquivo e calcula o caminho relativo a partir da pasta src.
    /* key: */ relative(
      "src",
      file.slice(0, file.length - extname(file).length)
    ),

    // Converte o caminho do arquivo para um caminho absoluto.
    /* value: */ fileURLToPath(new URL(file, import.meta.url)),
  ]);

  return Object.fromEntries(paths);
  // Converte o array de caminhos em um objeto.
};

const removeEmptyFiles = (): PluginOption => ({
  generateBundle(_, bundle) {
    for (const name in bundle) {
      const file = bundle[name];
      if (file.type !== "chunk") return;

      if (file.code.trim() === "") delete bundle[name];
      if (file.code.trim() === '"use strict";') delete bundle[name];
    }
  },
  name: "remove-empty-files",
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dtsPlugin({
      exclude: [
        "node_modules",
        "src/**/*.stories.tsx",
        "src/**/*.test.tsx",
        "src/setup-tests.ts",
      ],
      include: ["src"],
    }),
    // O plugin tsconfigPaths vai converter o compilerOptions.paths do tsconfig.json em resolve.alias do vite.
    tsconfigPaths(),
    removeEmptyFiles(),
  ],
  build: {
    lib: {
      // Definindo o ponto inicial da nossa biblioteca de componentes.
      entry: resolve(__dirname, "src/main.ts"),
      // Definindo os formatos de distribuição da nossa biblioteca (CommonJS e ESM).
      formats: ["cjs", "es"],
      // Definindo o nome do arquivo de saída.
      // EntryName é o nome do arquivo sem a extensão,
      // e format é o formato de distribuição.
      fileName(format, entryName) {
        if (format === "es") return `${entryName}.js`;
        return `${entryName}.${format}`;
      },
    },
    rollupOptions: {
      // Definindo as dependências externas da nossa biblioteca. (Que não serão incluídas no bundle)
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@tamagui/core",
        "@tamagui/vite-plugin",
      ],
      input: computeAllSrcFiles(),
    },
  },
});
