import prisma from "../config/prismaClient.js";
import { io } from "../app.js"; // Socket.io instance

export const createArticle = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });

    const article = await prisma.article.create({
      data: {
        title,
        content,
        category,
        publisherId: req.user.id,
      },
    });

    io.emit("new-article", article); // real-time notification
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { publisher: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { publisher: { select: { id: true, name: true } } },
    });
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
