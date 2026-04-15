import express from "express";
import dotenv from "dotenv-safe";
import cors from 'cors';
import userRoutes from "./ports/rest/routes/user";
import postRoutes from "./ports/rest/routes/post";
import commentRoutes from "./ports/rest/routes/comment";
import adminRoutes from "./ports/rest/routes/admin";
import { ConnectToDb } from "./infrastructure/mongodb/connection";
import logger from "./config/logger";

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.use("/healthcheck", (_req, res) => {
  res.status(200).json({ message: "Successful" });
});

app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:postId/comments", commentRoutes);
app.use("/admin", adminRoutes);

export default app;

if (require.main === module) {
  ConnectToDb();
  const port = 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}
