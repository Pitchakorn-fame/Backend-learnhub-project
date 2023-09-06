import { PrismaClient } from "@prisma/client";
import { newRepositoryUser } from "./repositories/user";
import { newHandlerUser } from "./handlers/user";

import express from "express";
import { createClient } from "redis";
import { newRepositoryBlacklist } from "./repositories/blacklist";
import { newMiddlewareHandler } from "./auth/jwt";
import { newRepositoryContent } from "./repositories/content";
import { newHandlerContent } from "./handlers/content";

async function main() {
  const db = new PrismaClient();
  const redis = createClient<any, any, any>();

  try {
    await redis.connect();
    await db.$connect();
  } catch (err) {
    console.log(err);
    return;
  }

  const repoUser = newRepositoryUser(db);
  const repoBlacklist = newRepositoryBlacklist(redis);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist);

  const middleware = newMiddlewareHandler(repoBlacklist);

  const repoContent = newRepositoryContent(db);
  const handlerContent = newHandlerContent(repoContent);

  const port = process.env.PORT || 8000;

  const server = express();
  const userRouter = express.Router();
  const contentRouter = express.Router();

  var cors = require("cors")
  server.use(cors())
  
  server.use(express.json());
  server.use("/user", userRouter);
  server.use("/content", contentRouter);

  server.get("/", (_, res) => {
    return res.status(200).json({ status: "ok" }).end();
  });

  //User
  userRouter.post("/", handlerUser.register.bind(handlerUser));
  userRouter.post("/login", handlerUser.login.bind(handlerUser));
  userRouter.post(
    "/logout",
    middleware.jwtMiddleware.bind(middleware),
    handlerUser.logout.bind(handlerUser)
  );

  //Content
  contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
  contentRouter.get("/:id", handlerContent.getContent.bind(handlerContent));
  contentRouter.post(
    "/",
    middleware.jwtMiddleware.bind(middleware),
    handlerContent.createContent.bind(handlerContent)
  );
  contentRouter.patch(
    "/:id",
    middleware.jwtMiddleware.bind(middleware),
    handlerContent.updateContent.bind(handlerContent)
  );
  contentRouter.delete(
    "/:id",
    middleware.jwtMiddleware.bind(middleware),
    handlerContent.deleteContent.bind(handlerContent)
  );

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
