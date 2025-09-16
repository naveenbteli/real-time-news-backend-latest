export const unsubscribeFromTopic = async (req, res) => {
  try {
    const { topicName } = req.body;
    const userId = req.user.id;

    const topic = await prisma.topic.findUnique({
      where: { name: topicName },
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    await prisma.userTopics.deleteMany({
      where: {
        userId: userId,
        topicId: topic.id,
      },
    });

    return res.status(200).json({ message: `Unsubscribed from topic: ${topic.name}` });
  } catch (err) {
    console.error("Error unsubscribing from topic:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
