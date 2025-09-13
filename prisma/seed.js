import prisma from "../src/config/prismaClient.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Publisher One", email: "publisher1@test.com", password: hashedPassword, role: "publisher" },
      { name: "User One", email: "user1@test.com", password: hashedPassword, role: "user" }
    ]
  });

  console.log("✅ Seed data created");
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
