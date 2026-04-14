import express, { Request, Response, NextFunction } from "express";
import { Comment } from "../../../infrastructure/mongodb/models/comment";
import { authenticate, AuthRequest } from "../../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

// GET all comments for a post
router.get("/", async (req: Request<{ postId: string }>, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST create comment (protected)
router.post("/", authenticate, async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const comment = await Comment.create({
      postId: req.params.postId,
      authorId: req.user!.id,
      body: req.body.body
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE comment (protected)
router.delete("/:commentId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
