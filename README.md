# Introdução

Muitas vezes, no desenvolvimento de aplicações mobile com React Native me veio a cabeça a possibilidade de reutilização de componentes no contexto web/mobile. Recentemente, conheci uma biblioteca chamada [Tamagui](https://tamagui.dev/) que permite que os componentes sejam compartilhados tanto no React Web quando no React Native.

Então tive o desafio de criar uma biblioteca de componentes separada que pudesse ser utilizada tanto no React Web quanto no React Native.

Na hora de escrita desse artigo, não há muitos exemplos disponíveis de utilização da Biblioteca Tamagui com Vite, então espero que esse artigo seja útil para vocês!

# Criando uma biblioteca de componentes reutilizáveis entre React e React Native com Tamagui, Vite, Vitest, PNPM e Storybook.

## TLDR;

Você pode conferir o repositório gerado por esse artigo [clicando aqui](https://github.com/alvarogfn/tamagui-vite-ds-example).

## 🚀 Introdução

* PNPM é um gerenciador de pacotes que oferece uma experiência de instalação e atualização de dependências mais rápida e eficiente.
* Storybook é uma ferramenta de desenvolvimento que permite visualizar e testar componentes de forma isolada.

## 📦 Configurando o Vite

Vamos iniciar o projeto criando um template com [vite](https://vitejs.dev/guide/). De acordo com a documentação do Vite, ele é `uma ferramenta de construção que tem como objetivo fornecer uma experiência de desenvolvimento mais rápida e leve para projetos web modernos.`

```bash
pnpm create vite@latest
```

```
╰─○ pnpm create vite@latest
✔ Project name: library
✔ Select a framework: › React
✔ Select a variant: › TypeScript + SWC
```

Esse setup vai nos dar uma configuração inicial com React e TypeScript orientado para o desenvolvimento de aplicações web, mas no nosso contexto, precisamos de uma configuração que permita o desenvolvimento de componentes para serem distribuídos para serem utilizados por outras aplicações.

Vamos atualizar o nosso `vite.config.ts` para configurar o modo de desenvolvimento de uma biblioteca.

```ts
// /vite.config.ts
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { 
      // definindo o ponto inicial da nossa biblioteca de componentes.
      entry: "src/index.ts", 
      // definindo os formatos de distribuição da nossa biblioteca (CommonJS e ESM).
      formats: ["cjs", "es"]  
    },
    rollupOptions: {
      // definindo as dependências externas da nossa biblioteca.
      // Essas dependências não serão incluídas no bundle final.
      external: ["react", "react/jsx-runtime", "react-dom"], 
    },
  },
});
```

No arquivo especificado em `entry`, vamos criar o ponto de entrada da nossa biblioteca.

```ts
// /src/index.ts
export * from "./components";
```

e vamos criar um componente de exemplo.

```tsx
// /src/components/Button/Button.tsx

export const Button = () => {
  return <button>Button</button>;
};
```

No final, nossa estrutura de arquivos se parecerá com isso:

```json
  /src
    /components
      /button
        button.tsx
        index.ts
      index.ts
    index.ts
  vite.config.ts
```

Quando o comando `pnpm vite build` for executado, alguns arquivos serão gerados dentro da pasta `dist` com o nome da sua biblioteca.

```js
// /dist/library.js

import { jsx as t } from "react/jsx-runtime";
const i = () => /* @__PURE__ */ t("button", { children: "Clique Aqui!" });
export {
  i as Button
};
```

Note que não há nenhuma dependência externa incluída no bundle final, pois definimos as dependências externas no `vite.config.ts`.

Por isso, vamos mover o React e o ReactDOM para as `devDependencies` e adicionar elas na seção de `peerDependencies` do nosso `package.json`.

```json
  "peerDependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
    // outras dependências
  }
```

_Você pode ler [esse artigo da Naveera](https://sentry.io/answers/npm-difference-between-dependencies/) para entender melhor
as diferenças entre dependências._

E atualizar a seção de scripts do package.json para incluir o comando de build do vite:

```json
// /package.json
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.4.3",
    "vite": "5.2.3",
    "vite-plugin-dts": "3.7.3"
  },
  "peerDependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
```
## Tipagens e source maps

Nessa nossa pasta de distribuição, também podemos ver que não há nenhum arquivo de tipagem ou source map. Para resolver isso, vamos instalar o `vite-plugin-dts`, e configurar o tsconfig para gerar arquivos de sourcemap.

```bash
  pnpm add -D vite-plugin-dts vite-tsconfig-paths@4.3.1
```

_A versão mais recente da biblioteca vite-tsconfig-paths pode não funcionar corretamente com o CommonJS, então vamos usar a versão 4.3.1._

```ts
// /vite.config.ts
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // O plugin dtsPlugin vai gerar arquivos de 
    // tipagem para cada arquivo dentro da pasta src.
    dtsPlugin(),
    // O plugin tsconfigPaths vai converter o 
    // compilerOptions.paths do tsconfig.json 
    // em resolve.alias do vite.
    tsconfigPaths(),
  ],
  build: {
    lib: { 
      entry: "src/index.ts", 
      // Definindo os formatos de distribuição da nossa biblioteca (CommonJS e ESM).
      formats: ["cjs", "es"] 
    },
    rollupOptions: {
      // Definindo as dependências externas da nossa biblioteca. 
      // Essas dependências não serão incluídas no bundle final.
      external: ["react", "react/jsx-runtime", "react-dom"],
    },
  },
});
```

```json
// /tsconfig.json
    // ...
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    // ...
```

```json
// /package.json
  // ...
  "source": "./src/index.ts",
  "files": [
    "dist",
    "src"
  ],
  // ...
```

Os arquivos index.d.ts.map vão permitir que os editores identifiquem qual é o arquivo de código fonte de cada componente, e os arquivos index.d.ts permitem que o typescript infira tipos para os componentes da biblioteca.

## 📦 Configurando cada arquivo como um entry point

Vocês podem ter notado, agora a nossa pasta de `dist` contém os seguintes arquivos gerados:
```
dist/
  components/
    Button/
      Button.d.ts
      Button.d.ts.map
      index.d.ts
      index.d.ts.map
    index.d.ts
    index.d.ts.map
  index.d.ts
  index.d.ts.map
  library.js
  library.cjs
```

Isso acontece porque o vite faz a junção de todos os arquivos em um único bundle por padrão, enquanto a biblioteca `vite-plugin-dts` mantém a estrutura dos nossos arquivos. O comportamento padrão do vite é útil para aplicações web, mas para bibliotecas de componentes, é mais interessante que cada arquivo seja um entry point separado, isso vai permitir que bundlers como `vite` e `webpack` removam os componentes que não estão sendo utilizados no build final.

## 📦 Configurando cada arquivo como um entry point

Para configurar cada arquivo como um entry point, vamos utilizar a biblioteca `glob`, que vai nos permitir encontrar cada arquivo dentro da pasta `src` a partir de uma expressão minimatch.

```bash
pnpm add -D glob @types/node
```
_A biblioteca @types/node vai permitir que usemos bibliotecas internas do node com typescript, como `node:url` e `node:path`._

É necessário atualizar o nosso `vite.config.ts` para que ele encontre todos os arquivos dentro da pasta `src` e os adicione como entry point nas configurações do rollup.


```ts
// /vite.config.ts

import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

// Caminho absoluto do diretório atual a partir da raiz do sistema de arquivos.
const __dirname = dirname(fileURLToPath(import.meta.url)); // /home/user/pasta/library ou C:\Users\user\pasta\library

const computeAllSrcFiles = (): Record<string, string> => {
  // Encontra todos os arquivos .ts e .tsx dentro da pasta src.
  const files = glob.sync(["src/**/*.{ts,tsx}"]);

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dtsPlugin(),
    // O plugin tsconfigPaths vai converter o compilerOptions.paths do tsconfig.json em resolve.alias do vite. 
    tsconfigPaths()
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
      external: ["react", "react/jsx-runtime", "react-dom"],
      input: computeAllSrcFiles(),
    },
  },
});
```

Agora, a nossa pasta de distribuição vai conter os seguintes arquivos gerados:
```
  /dist
    /components
      Button.cjs
      Button.d.ts
      Button.d.ts.map
      Button.js
      Button.cjs
      index.d.ts
      index.d.ts.map
      index.js
    index.cjs
    index.d.ts
    index.d.ts.map
    index.js
```


## 📦 Configurando o Storybook

Podemos configurar o nosso arquivo inicial do Storybook com o comando:

```bash
# No momento de escrita desse artigo, a versão do storybook é a 8.0.4
npx storybook@latest init
```

Isso vai gerar uma pasta chamada `.storybook` com arquivos chamados main e preview, além de uma pasta de exemplos chamada `stories`.

```json
  .storybook/
    main.ts
    preview.ts
  src/ 
    stories/
```

Vamos excluir a pasta stories, pois ela só contém exemplos, e melhorar o nosso componente Button para incluir 
um arquivo de `button.stories.tsx`, e um arquivo de `button.types.ts` contendo a tipagem das suas props.

```ts
// /src/components/button/button.types.ts

import { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  // a interface ComponentPropsWithoutRef trás a tipagem base do elemento <button> sem adicionar um ref.
  children?: ReactNode;
};
```


```tsx
// /src/components/button/button.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

export default {
  args: {
    children: "Olá, mundo!",
  },
  argTypes: {
    children: { description: "Conteúdo do botão" },
  },
  component: Button,
  title: "Components/Button",
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const StoryDefault: Story = {
  name: "Default",
  render: ({ children, ...props }) => <Button {...props}>{children}</Button>,
};
```

```tsx
// /src/components/button/button.tsx

import { ButtonProps } from "./button.types";

export const Button = ({ children, ...props }: ButtonProps) => (
  <button {...props}>{children}</button>
);
```

Após fazer esses ajustes e reiniciar o storybook (`pnpm storybook`), você vai notar que o nosso componente de botão já foi renderizado na tela.

![alt text](image.png)

## Removendo arquivos desnecessários do build

Ao fazer build desse componente, você vai notar que os arquivos que usamos para criar documentação foram parar na pasta de build. 
Vamos remover esses arquivos atualizando a função `computeAllSrcFiles` no `vite.config.ts` para ignorar arquivos que contenham `stories.tsx`

```ts
// /vite.config.ts

const computeAllSrcFiles = (): Record<string, string> => {
  // Encontra todos os arquivos .ts e .tsx dentro da pasta src.
  const files = glob.sync(["src/**/*.{ts,tsx}"], {
    ignore: ["src/**/*.stories.tsx"],
  });
  // ...
```

Você também pode notar que alguns arquivos como o `button.types.js` foram gerados sem conteúdo javascript nenhum. Isso é porque esses arquivos só contém declarações de tipo.

Podemos remover esses arquivos vazios gerandos criando um plugin customizado para o vite.

```tsx
// vite.config.ts
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

export default defineConfig({
  plugins: [
    // Também é necessário configurar o plugin dts para ignorar esses arquivos na geração de arquivos d.ts e d.ts.map
    dtsPlugin({
      exclude: ["node_modules", "src/**/*.stories.tsx"],
      include: ["src"],
    }),
    tsconfigPaths(),
    removeEmptyFiles(),
  ],
  // ...
```

Essa função vai verificar se algum `chunk` de dado está vazio ou se apenas contém a declaração de use strict, se verdadeiro, esse conteúdo será removido do bundle final.


## Adicionando Vitest com React Testing Library

Para configurar o vitest no nosso projeto, vamos instalar as dependências necessárias para o vitest junto as dependências 
do React Testing Library.

```bash
pnpm add -D vitest @testing-library/jest-dom @testing-library/react @testing-library/user-event @vitest/coverage-istanbul jsdom
```

e criar um arquivo chamado `vitest.config.ts` no root do projeto.

```ts
// /vitest.config.ts
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Configuração do coverage (opcional)
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/setup-tests.ts"],
  },
});
```

E um arquivo setup para os testes estendendo as funcionalidades do vitest com o jest-dom.

```ts
// /src/setup-tests.ts
import "@testing-library/jest-dom/vitest";
```

É necessário fazer alguns ajustes no tsconfig para que ele reconheça as variáveis globais do vitest.

```json
// /tsconfig.json
  "compilerOptions": {
    // adicione referencia ao vitest/globals no types.
    "types": ["vitest/globals"], 
    // ...
```

E adicionar um script no package.json para rodar os testes.

```json
// /package.json
  "scripts": {
    "test": "vitest"
  },
```

Finalmente, vamos criar um teste para o nosso componente de botão.

```tsx
// /src/components/button/button.test.tsx

import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("[Components]: Button", () => {
  it("renders without crash", () => {
    render(<Button>Hello World</Button>)
    const component = screen.getByText("Hello World");
    expect(component).toBeDefined();
  });
});
```

E vamos ver a mensagem que de os teste passaram.

```bash
 ✓ src/components/button/button.test.tsx (1)
   ✓ [Components]: Button (1)
     ✓ renders without crash

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  15:29:37
   Duration  383ms
```

Também é necessário configurar o `vite.config.ts` para que ele ignore os arquivos de teste e setup ao fazer o build da biblioteca.

Ao final dessa etapa, o nosso vite.config.ts estará assim:

```ts
// /vite.config.ts

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
```

## Adicionando React Native & Tamagui

O Tamagui é uma biblioteca de componentes reutilizáveis entre React e React Native. Com ela, é possível criar componentes que funcionam tanto em aplicações web quanto em aplicações mobile, sem a necessidade de reescrever o código.

Antes de configurarmos o Tamagui na nossa biblioteca, precisamos configurar o modo de resolução do pnpm para ser semelhante ao do `npm` e `yarn`, isso vai fazer com que as dependências funcionem corretamente no storybook e no vitest:

```
# https://pnpm.io/npmrc#node-linker
node-linker=hoisted
```

Após setar essa configuração, rode novamente `pnpm install`.

```bash
pnpm add expo expo-linear-gradient -D react-native @tamagui/core @tamagui/vite-plugin
```
_Atualmente, o tamagui tem dependência do expo-linear-gradient mesmo em contextos web, então é necessário instalar ambas as bibliotecas do expo._

Após instalar o tamagui e as suas dependências, é necessário configura-lo no `vite.config.ts` para que ele seja uma dependência externa, e que tanto o @tamagui quanto o react-native sejam uma 'peer dependency'.

```json
// /package.json

 "peerDependencies": {
    "@tamagui/core": "1.91.4",
    "@tamagui/vite-plugin": "1.91.4",
    // O metro-plugin é responsável por fazer o tamagui funcionar no contexto do react-native.
    "@tamagui/metro-plugin": "1.91.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.73.5"
  },
  // Vamos usar esse campo para definir as peer dependências que não são obrigatórias.
  "peerDependenciesMeta": {
    // Não usaremos react-dom no contexto do react-native.
    "react-dom": {
      "optional": true
    },
    // não usaremos o react-native no contexto do web.
    "react-native": {
      "optional": true
    },
    // Não é obrigatório utilizar o vite como bundler;
    "@tamagui/vite-plugin": {
      "optional": true
    },
    // Não é obrigatório utilizar o metro como bundler;
    "@tamagui/metro-plugin": {
      "optional": true
    }
  },
```

E no `vite.config.ts`:

```ts
// /vite.config.ts
    rollupOptions: {
      // Definindo as dependências externas da nossa biblioteca. (Que não serão incluídas no bundle)
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@tamagui/core",
        "@tamagui/vite-plugin",
      ],
```

Também será necessário criar um arquivo de configuração inicial para o tamagui chamado `tamagui.config.ts`, irei criar esse arquivo na pasta `src/themes`.

```ts
// /src/themes/tamagui.config.ts
import { createTamagui } from "@tamagui/core";

// Você é livre para definir os tokens e temas do tamagui como quiser.
// no nosso caso, vamos definir apenas duas cores e dois temas.
const config = createTamagui({
  fonts: {},
  shorthands: {},
  themes: {
    night: {
      color: "#005",
    },
    sun: {
      color: "#FA0",
    },
  },
  tokens: {
    color: {
      primary: "#000",
      secondary: "#FFF",
    },
    radius: {},
    size: {},
    space: {},
    zIndex: {},
  },
});


export default config;
```

Feito a configuração inicial, vamos configurar o typescript para reconhecer os tipos customizados definidos no tamagui.config.ts criando um arquivo `src/types.d.ts` e adicionando a seguinte configuração.

```ts
// src/types.d.ts

import config from "./themes/tamagui.config";

export type AppConfig = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

Nós extraímos o tipo de config e atribuímos ao tipo de TamaguiCustomConfig. Isso vai permitir que o typescript reconheça os tipos constantes definidos no `src/themes/tamagui.config.ts`.

### ThemeProvider

Para que o sistema de tokens e temas do tamagui funcione, é necessário criar um provider que injete o contexto do tamagui na aplicação. Vamos criar um arquivo chamado `theme-provider.tsx` na pasta `src/themes`. Esse provider deverá ser utilizado pelo storybook, testes e pelo consumidor da biblioteca.

```tsx
// /src/themes/theme-provider.tsx
import { TamaguiProvider, TamaguiProviderProps } from "@tamagui/core";
import { PropsWithChildren } from "react";
import appConfig from "./tamagui.config";

type ThemeProviderProps = PropsWithChildren<TamaguiProviderProps>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <TamaguiProvider config={appConfig} {...props}>
      {children}
    </TamaguiProvider>
  );
}
```


### Configurando Tamagui nos testes com vitest

Para que o Tamagui funcione nos testes com o vitest, é necessário adicionar o plugin responsável pelo processamento dos componentes do tamagui.

```bash
pnpm add -D  @tamagui/vite-plugin
```

E adiciona-lo no vitest.config.ts


```tsx
// /vitest.config.ts
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { tamaguiPlugin } = require("@tamagui/vite-plugin");

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tamaguiPlugin({
      components: ["@tamagui/core"],
      // O plugin do tamagui foi colocado na seção de plugins do vitest, apontando para nossa configuração personalizada de tokens.
      config: "src/themes/tamagui.config.ts",
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    server: {
      // Como os testes rodam no contexto do node, essa configuração é necessária para remover os imports e exports do ESM.
      deps: {
        inline: ["@tamagui"],
      },
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/setup-tests.ts"],
  },
});
```

Também é necessário adicionar o provider em cada teste unitário, pois o tamagui precisa do contexto do provider para funcionar corretamente.

Para adicionar o provider em todos os testes de forma prática, podemos criar um render customizado que será utilizado por todos os testes ao invés do render tradicional exportado pela biblioteca `@testing-library/react`. vamos criar um arquivo no diretório `src/__tests__/setup.tsx` que conterá o nosso render customizado. Esse render deve ser importado no lugar do render do `@testing-library/react` para garantir que nossos testes funcionem.

```tsx
// /src/__tests__/setup.tsx

import {
  queries,
  Queries,
  render as nativeRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider } from "@tamagui/core";
import { ReactElement } from "react";
import config from "../themes/tamagui.config";

const render = <
  Q extends Queries = typeof queries,
  Container extends DocumentFragment | Element = HTMLElement,
  BaseElement extends DocumentFragment | Element = Container,
>(
  ui: ReactElement,
  renderOptions?: RenderOptions<Q, Container, BaseElement>
): RenderResult<Q, Container, BaseElement> =>
  nativeRender(<TamaguiProvider config={config}>{ui}</TamaguiProvider>, {
    ...renderOptions,
  });

export * from "@testing-library/react";
export { render };
```

Também é necessário adicionar o plugin do Tamagui dentro da configuração de plugins Vitest, e fazer alguns ajustes para que o ambiente de CJS não dê conflito com o ESM do vitest:

Após esses ajustes, o nosso projeto já está configurado para rodar os testes mesmo com os componentes do Tamagui. finalmente, vamos integrar o nosso componente de texto com o Tamagui:

```ts
// /src/components/text/text.styles.ts

import { Text, styled } from "@tamagui/core";

export const StyledText = styled(Text, {
  color: "$black",
});
```

```tsx
// /src/components/text/text.types.tsx
import { GetProps } from "@tamagui/core";
import type { StyledText } from "./text.styles";

export type TextProps = GetProps<typeof StyledText>;
```

```tsx
// /src/components/text/text.tsx

import { GetProps } from "@tamagui/core";
import type { StyledText } from "./text.styles";

export type TextProps = GetProps<typeof StyledText>;
```

```tsx
// /src/components/text/text.stories.tsx

import { Text } from "./text";

import { render, screen } from "../../__tests__/setup";

describe("[Components]: Text", () => {
  it("renders without crash", () => {
    render(<Text>Hello World</Text>);
    const component = screen.getByText("Hello World");
    expect(component).toBeDefined();
  });
});
```

Ao rodar o teste, você verá que a integração já está funcionando:

```tsx
✓ src/components/text/text.test.tsx (1)
   ✓ [Components]: Text (1)
     ✓ renders without crash

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  21:36:14
   Duration  460ms

```


## Configurando o Tamagui no Storybook

Para fazer o Tamagui funcionar no contexto do storybook, os passos são semelhantes aos dos testes, você precisa injetar o plugin do tamagui no storybook e adicionar o provider em cada story.

Podemos adicionar o plugin ao storybook da seguinte forma:

```tsx
// /.storybook/main.ts

import { tamaguiPlugin } from "@tamagui/vite-plugin";
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  docs: {
    autodocs: true,
  },
  env: (config) => ({
    ...config,
    // Definindo o target do tamagui para renderizar para web
    TAMAGUI_TARGET: "web",
  }),
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/**/*.mdx",
    "../docs/**/*.mdx",
  ],
  viteFinal: (config, { configType }) => {
    config.define = {
      // variáveis de ambiente para o dar contexto o para o tamagui
      ...config.define,
      "process.env.NODE_ENV":
        configType === "PRODUCTION" ? "production" : "development",
      "process.env.STORYBOOK": true,
    };

    config.plugins!.push(
      tamaguiPlugin({
        // Referencia a partir do caminho absoluto para o tamagui.config.ts
        config: "/src/themes/tamagui.config.ts",
      }),
      tsconfigPaths()
    );

    return config;
  },
};
export default config;
```

E agora injetaremos o provider 

```tsx
// /.storybook/preview.tsx

import type { Preview } from "@storybook/react";

import { ThemeProvider } from "../src/themes/theme-provider";

const preview: Preview = {
  decorators: [
    (Story) => (
      // colocamos o provider para renderizar em todos os stories
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
};

export default preview;
```