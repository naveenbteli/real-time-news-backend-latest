import express from "express";
import { UserRole } from "@prisma/client";

import {
  createArticle,
  getAllArticles,
  getArticleById,
} from "../controllers/articleController.js";

import { subscribeToTopic } from "../controllers/subscribeController.js";
import { unsubscribeToTopic } from "../controllers/unsubscribeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Create a new article - Publisher only
 * Endpoint: POST /articles
 */
router.post(
  "/",
  protect,
  authorize(UserRole.PUBLISHER),
  createArticle
);

/**
 * Get all articles
 * Endpoint: GET /articles
 */
router.get("/", protect, getAllArticles);

/**
 * Subscribe to topics
 * Endpoint: POST /articles/subscribe
 */
router.post("/subscribe", protect, subscribeToTopic);

router.post("/unsubscribe", protect, unsubscribeToTopic);

/**
 * Get article by ID
 * Endpoint: GET /articles/:id
 */
router.get("/:id", protect, getArticleById);

export default router;
