import { data } from "react-router";
import type { Route } from "./+types/[_content].refresh-content";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.headers.get("auth") !== import.meta.env.VITE_REFRESH_TOKEN) {
    return data({ message: "Not Authorised" }, { status: 401 });
  }

  const body = await request.text();

  const queryParams = new URLSearchParams();
  queryParams.set("_data", "routes/_content/update-content");

  const response = await fetch(
    `http:localhost:5173/_content/update-content?${queryParams}`,
    {
      method: "POST",
      body,
      headers: {
        auth: import.meta.env.VITE_REFRESH_TOKEN,
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body).toString(),
      },
    }
  );

  return data(response);
};
