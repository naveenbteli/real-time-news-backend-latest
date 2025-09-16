import prisma from "../config/prismaClient.js";

export const unsubscribeToTopic = async (req, res) => {
  try {
    const { topicName } = req.body;
    const userId = req.user?.id; // Ensure middleware populates req.user

    console.log("Incoming unsubscribe request:", { topicName, userId });

    // Validate request
    if (!topicName) {
      return res.status(400).json({ error: "Topic name is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - user not found" });
    }

    // Step 1: Find the topic
    const topic = await prisma.topic.findUnique({
      where: { name: topicName },
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Step 2: Delete subscription (if it exists)
    try {
      const deletedSubscription = await prisma.subscription.delete({
        where: {
          userId_topicId: {
            userId: userId,
            topicId: topic.id,
          },
        },
      });

      console.log("Unsubscribed successfully:", deletedSubscription);

      return res.status(200).json({
        message: `User unsubscribed from topic: ${topic.name}`,
        subscription: deletedSubscription,
      });
    } catch (err) {
      // If subscription doesn’t exist, Prisma throws an error
      console.error("No existing subscription found:", err.message);
      return res.status(404).json({
        error: `User is not subscribed to topic: ${topicName}`,
      });
    }
  } catch (err) {
    console.error("❌ Error unsubscribing from topic:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};
