import prisma from "../config/prismaClient.js";

export const subscribeToTopic = async (req, res) => {
  try {
    const { topicName } = req.body;
    const userId = req.user?.id; // Ensure middleware populates req.user

    console.log("Incoming subscription request:", { topicName, userId });

    // Validate request
    if (!topicName) {
      return res.status(400).json({ error: "Topic name is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - user not found" });
    }

    // Step 1: Create or get the topic
    const topic = await prisma.topic.upsert({
      where: { name: topicName },
      update: {}, // no updates if exists
      create: { name: topicName },
    });

    console.log("Topic fetched/created:", topic);

    // Step 2: Create or confirm the subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_topicId: {
          userId: userId,
          topicId: topic.id,
        },
      },
      update: {}, // Do nothing if already subscribed
      create: {
        userId: userId,
        topicId: topic.id,
      },
    });

    console.log("Subscription successful:", subscription);

    return res.status(200).json({
      message: `User subscribed to topic: ${topic.name}`,
      subscription,
    });
  } catch (err) {
    console.error("❌ Error subscribing to topic:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};
