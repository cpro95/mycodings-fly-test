/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

declare global {
  var client: PrismaClient | undefined;
}

let client: PrismaClient;

console.log("in db.server.ts");
console.log(process.env.NODE_ENV);
console.log("-====================-");

if (process.env.NODE_ENV === "production") {
  client = new PrismaClient();
} else {
  if (!global.client) {
    global.client = client = new PrismaClient();
  } else {
    client = global.client;
  }
}

export default client;
