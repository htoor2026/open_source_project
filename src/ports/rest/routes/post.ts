import express, { Response, NextFunction } from "express";
import { Post } from "../../../infrastructure/mongodb/models/post";
import { authenticate, AuthRequest } from "../../../middleware/authMiddleware";

const router = express.Router();

// GET all posts
router.get("/", async (_req, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET single post
router.get("/:id", async (req, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST create post (protected)
router.post("/", authenticate, async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { title, body } = req.body;
    const post = await Post.create({
      title,
      body,
      authorId: req.user!.id
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE post (protected)
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    if (post.authorId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
