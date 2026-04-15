import express, { Request, Response, NextFunction } from "express";
import { Post } from "../../../infrastructure/mongodb/models/post";
import { PostLike } from "../../../infrastructure/mongodb/models/postLike";
import { authenticate, AuthRequest } from "../../../middleware/authMiddleware";
import logger from "../../../config/logger";

const router = express.Router();

// GET all posts
router.get("/", async (_req, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    logger.info(`Fetched ${posts.length} posts`);
    res.status(200).json(posts);
  } catch (error) {
    logger.error(`GET /posts error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET single post
router.get("/:id", async (req, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: "Post not found" }); return; }
    res.status(200).json(post);
  } catch (error) {
    logger.error(`GET /posts/:id error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST create post (protected)
router.post("/", authenticate, async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { title, body } = req.body;
    const post = await Post.create({ title, body, authorId: req.user!.id });
    logger.info(`Post created by user ${req.user!.id}`);
    res.status(201).json(post);
  } catch (error) {
    logger.error(`POST /posts error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT edit post (protected)
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: "Post not found" }); return; }

    const isSuperUser = req.user!.role === 'admin';
    if (post.authorId !== req.user!.id && !isSuperUser) {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    post.title = req.body.title ?? post.title;
    post.body  = req.body.body  ?? post.body;
    await post.save();

    logger.info(`Post ${post.id} updated by user ${req.user!.id}`);
    res.status(200).json(post);
  } catch (error) {
    logger.error(`PUT /posts/:id error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE post (protected)
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: "Post not found" }); return; }

    if (post.authorId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    await post.deleteOne();
    logger.info(`Post ${req.params.id} deleted by user ${req.user!.id}`);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    logger.error(`DELETE /posts/:id error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST like a post (protected)
router.post("/:id/like", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await PostLike.findOne({ postId: req.params.id, userId: req.user!.id });
    if (existing) {
      await existing.deleteOne();
      logger.info(`Post ${req.params.id} unliked by user ${req.user!.id}`);
      res.status(200).json({ message: "Post unliked" });
      return;
    }
    await PostLike.create({ postId: req.params.id, userId: req.user!.id });
    logger.info(`Post ${req.params.id} liked by user ${req.user!.id}`);
    res.status(201).json({ message: "Post liked" });
  } catch (error) {
    logger.error(`POST /posts/:id/like error: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
