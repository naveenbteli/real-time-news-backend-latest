import express from "express";
import { createArticle, getAllArticles, getArticleById } from "../controllers/articleController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("publisher"), createArticle);
router.get("/", protect, getAllArticles);
router.get("/:id", protect, getArticleById);

export default router;
