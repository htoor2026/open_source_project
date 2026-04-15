import express, { Response } from "express";
import { User } from "../../../infrastructure/mongodb/models/user";
import { Post } from "../../../infrastructure/mongodb/models/post";
import { Comment } from "../../../infrastructure/mongodb/models/comment";
import { PostLike } from "../../../infrastructure/mongodb/models/postLike";
import { authenticate, requireAdmin, AuthRequest } from "../../../middleware/authMiddleware";
import logger from "../../../config/logger";

const router = express.Router();

// GET /admin/stats — site analytics (admin only)
router.get("/stats", authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalLikes] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      PostLike.countDocuments()
    ]);

    logger.info("Admin stats fetched");
    res.status(200).json({ totalUsers, totalPosts, totalComments, totalLikes });
  } catch (error) {
    logger.error(`GET /admin/stats error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /admin/users — list all users (admin only)
router.get("/users", authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    logger.error(`GET /admin/users error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
