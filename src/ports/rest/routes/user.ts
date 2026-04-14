import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../infrastructure/mongodb/models/user";

const router = express.Router();

// POST /user/create
router.post("/create", async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { userName, userPassword, role } = req.body;

    const existing = await User.findOne({ username: userName });
    if (existing) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(userPassword, 10);

    const user = await User.create({
      username: userName,
      email: req.body.email || `${userName}@placeholder.com`,
      passwordHash,
      role: role || "user"
    });

    res.status(201).json({
      id: user._id,
      userName: user.username,
      role: user.role
    });

  } catch (error) {
    console.log(`Error in user create: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /user/login
router.post("/login", async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { userName, userPassword } = req.body;

    const user = await User.findOne({ username: userName });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(userPassword, user.passwordHash);
    if (!match) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign(
      { sub: (user._id as any).toString(), role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "User logged in successfully!",
      token,
      user: { id: user._id, userName: user.username, role: user.role }
    });

  } catch (error) {
    console.log(`Error in user login: ${(error as Error).message}`);
    res.status(500).json({ message: (error as Error).message });
  }
});

export = router;
