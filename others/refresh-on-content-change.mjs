import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import { postJSONasHttp } from "./utils.mjs";
import https from "https";

const watchPath = path.resolve(process.cwd(), "content");
const refreshPath = path.resolve(process.cwd(), "app", "refresh.ignore.js");
const watcher = chokidar.watch(watchPath);

watcher.on("ready", () => {
  watcher.on("all", (_eventName, changePath) => {
    const relativeChangePath = changePath.replace(
      `${path.resolve(process.cwd(), "content")}/`,
      ""
    );
    console.log("🛠 content changed", relativeChangePath);

    postJSONasHttp({
      https,
      postData: {
        paths: [relativeChangePath],
      },
      overrideOptions: {
        hostname: "localhost",
        port: 5173,
        path: `/_content/update-content`,
      },
    })
      .then(() => {
        console.log("🚀 Finished updating content");
        setTimeout(() => {
          fs.writeFileSync(refreshPath, `// ${new Date()}`);
        }, 250);
      })
      .catch((err) => {
        console.error(err);
      });
  });
});
