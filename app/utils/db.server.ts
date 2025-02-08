/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

declare global {
  var client: PrismaClient | undefined;
}

let client: PrismaClient;

if (import.meta.env.MODE === "production") {
  client = new PrismaClient();
} else {
  if (!global.client) {
    global.client = client = new PrismaClient();
  } else {
    client = global.client;
  }
}

export default client;
