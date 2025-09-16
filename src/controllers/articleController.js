import prisma from "../config/prismaClient.js";
import { io } from "../app.js";
import { checkIfFakeArticle, predictCategory } from "../services/mlService.js";

/**
 * @desc Create a new article
 * @route POST /articles
 * @access Publisher
 */
export const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Step 1: Validate input
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Step 2: Verify if article is fake
    const isFake = await checkIfFakeArticle(title, content);

if (isFake) {
  return res.status(400).json({
    error: "The article is detected as fake and cannot be published",
  });
}


    // Step 3: Predict category using ML model
const predictedCategory = await predictCategory(title,content);


console.log("Predicted Category:", predictedCategory);

    // Ensure the predicted category exists or create it
    const topic = await prisma.topic.upsert({
      where: { name: predictedCategory },
      update: {},
      create: { name: predictedCategory },
    });

    // Step 4: Create the article and link it to the topic
    const article = await prisma.article.create({
      data: {
        title,
        content,
        sentiment: null, // Future feature for sentiment analysis
        fakeFlag: false,
        publisherId: req.user.id,
        topics: {
          create: [{ topicId: topic.id }],
        },
      },
      include: {
        topics: { include: { topic: true } },
        publisher: { select: { id: true, name: true } },
      },
    });

    // Step 5: Fetch all subscribers for this topic
    const subscribers = await prisma.subscription.findMany({
      where: { topicId: topic.id },
      select: { userId: true },
    });

    // Step 6: Emit live event to subscribed users only
   if (subscribers.length > 0) {
  subscribers.forEach(({ userId }) => {
    const roomName = `user_${userId}`;
    console.log(`📢 Sending live alert to ${roomName}`);
    io.to(roomName).emit("new-article", article);
  });
} else {
  console.log(`⚠️ No subscribers found for topic: ${predictedCategory}`);
}

    return res.status(201).json(article);
  } catch (err) {
    console.error("❌ Error creating article:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Get all articles
 * @route GET /articles
 * @access Authenticated users
 */
export const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(articles);
  } catch (err) {
    console.error("❌ Error fetching articles:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Get single article by ID
 * @route GET /articles/:id
 * @access Authenticated users
 */
export const getArticleById = async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.json(article);
  } catch (err) {
    console.error("❌ Error fetching article by ID:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
