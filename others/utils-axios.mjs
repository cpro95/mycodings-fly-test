// const execSync = require("child_process").execSync;
import { execSync } from "child_process";
import axios from "axios";

export async function fetchJSON({ url }) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error!", error.message);
    throw error;
  }
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
    baseURL: `https://${process.env.FLY_APP_NAME}.fly.dev`,
    url: `/_content/refresh-content?${searchParams}`,
    method: "POST",
    headers: {
      auth: process.env.REFRESH_TOKEN,
      "Content-Type": "application/json",
      ...overrideHeaders,
    },
    data: postData,
    // ...overrideOptions, // 개발서버일 경우 baseURL, url 등이 override됨
  };

  // 개발 환경의 overrideOptions 적용
  if (overrideOptions.hostname && overrideOptions.port) {
    defaultOptions.baseURL = `https://${overrideOptions.hostname}:${overrideOptions.port}`;
    defaultOptions.url = overrideOptions.path;
  }
  console.log(`Requesting: ${defaultOptions.baseURL}${defaultOptions.url}`);

  console.log(`in postJSON function searchParams : ${searchParams}`);

  try {
    const response = await axios(defaultOptions);
    return response.data;
  } catch (error) {
    console.error("Error!", error.message);
    throw error;
  }
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

// module.exports = { fetchJSON, getChangedFiles, postJSON };
