import { Prisma, PrismaClient } from "@prisma/client";
import { setDefaultResultOrder } from "node:dns";
import { env } from "./env.js";

setDefaultResultOrder("ipv4first");

const base = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});

const readOperations = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy"
]);

const transientCodes = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

function isTransient(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && transientCodes.has(error.code);
}

export const prisma = base.$extends({
  query: {
    async $allOperations({ operation, args, query }) {
      if (!readOperations.has(operation)) {
        return query(args);
      }
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await query(args);
        } catch (error) {
          if (!isTransient(error) || attempt >= 4) throw error;
          await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
        }
      }
    }
  }
});
