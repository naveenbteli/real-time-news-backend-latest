import prisma from "../config/prismaClient.js";
import { io } from "../app.js";
import { checkIfFakeArticle, predictCategory } from "../services/mlService.js";

export const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Step 1: Check if article is fake
    const isFake = await checkIfFakeArticle(title, content);
    if (isFake) {
      return res.status(400).json({ error: "The article is detected as fake and cannot be published" });
    }

    // Step 2: Predict category
    const predictedCategory = await predictCategory(title, content);

    // Step 3: Save article to DB
    const article = await prisma.article.create({
      data: {
        title,
        content,
        sentiment: null, // you can later integrate sentiment analysis
        fakeFlag: false,
        publisherId: req.user.id,
        topics: {
          create: [
            {
              topic: {
                connectOrCreate: {
                  where: { name: predictedCategory },
                  create: { name: predictedCategory },
                },
              },
            },
          ],
        },
      },
      include: {
        topics: { include: { topic: true } },
      },
    });

    // Step 4: Emit real-time event
    io.emit("new-article", article);

    return res.status(201).json(article);
  } catch (err) {
    console.error("Error creating article:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        publisher: { select: { id: true, name: true } },
        topics: { include: { topic: true } },
      },
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
      include: {
        publisher: { select: { id: true, name: true } },
        topics: { include: { topic: true } },
      },
    });

    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
