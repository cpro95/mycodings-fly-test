import { execSync } from "child_process";
import http from "http";

export async function fetchJSON({ url }) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: "GET" }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });
    req.on("error", (error) => {
      reject(error);
    });
    req.end();
  });
}

export async function postJSON({
  postData,
  overrideOptions = {},
  overrideHeaders = {},
}) {
  const searchParams = new URLSearchParams([
    ["_data", "routes/[_content].refresh-content"],
  ]);

  const defaultOptions = {
    hostname: process.env.FLY_APP_NAME + ".fly.dev",
    port: 443,
    path: `/_content/refresh-content?${searchParams}`,
    method: "POST",
    headers: {
      auth: process.env.REFRESH_TOKEN,
      "Content-Type": "application/json",
      ...overrideHeaders,
    },
  };

  // 개발 환경의 overrideOptions 적용
  if (overrideOptions.hostname && overrideOptions.port) {
    defaultOptions.hostname = overrideOptions.hostname;
    defaultOptions.port = overrideOptions.port;
    defaultOptions.path = overrideOptions.path;
  }
  console.log(`Requesting: ${defaultOptions.hostname}${defaultOptions.path}`);

  return new Promise((resolve, reject) => {
    const req = http.request(defaultOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });
    req.on("error", (error) => {
      reject(error);
    });
    req.write(JSON.stringify(postData));
    req.end();
  });
}

export function getChangedFiles(sha, compareSha) {
  try {
    const pattern = /^(?<change>\w).*?\s+(?<filename>.+$)/;

    const diff = execSync(
      `git diff --name-status ${sha} ${compareSha}`
    ).toString();

    const changedFiles = diff
      .split("\n")
      .map((line) => line.match(pattern)?.groups)
      .filter(Boolean);

    const changes = [];
    for (const { change, filename } of changedFiles) {
      changes.push({ change, filename });
    }

    return changes;
  } catch (e) {
    console.error(e);
    return null;
  }
}
