import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  console.log(process.env);
  const isProduction = process.env.NODE_ENV === "production";
  const resolvedCommand = process.env.npm_lifecycle_event || command;
  console.log(`isProduction : ${isProduction}`);

  console.log(`command : ${command}`);
  console.log(`mode : ${mode}`);
  console.log(`isSsrBuild : ${isSsrBuild}`);
  console.log(`isPreview : ${isPreview}`);
  if (command === "serve") {
    return {
      css: {
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      },
      define: {
        __COMMAND__: JSON.stringify(resolvedCommand),
      },
      plugins: [
        reactRouter(),
        tsconfigPaths(),
        {
          name: "msw-plugin",
          configureServer(server) {
            import("./mocks/").then(({ server: mswServer }) => {
              mswServer.listen();
              console.log("📡 MSW server started with Vite");
            });
          },
        },
      ],
    };
  } else {
    return {
      css: {
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      },
      plugins: [reactRouter(), tsconfigPaths()],
    };
  }
});

// export default defineConfig({
//   css: {
//     postcss: {
//       plugins: [tailwindcss, autoprefixer],
//     },
//   },
//   plugins: [
//     reactRouter(),
//     tsconfigPaths(),
//     {
//       name: "msw-plugin",
//       configureServer(server) {
//         import("./mocks").then(({ server: mswServer }) => {
//           mswServer.listen();
//           console.log("📡 MSW server started with Vite");
//         });
//       },
//     },
//   ],
// });
