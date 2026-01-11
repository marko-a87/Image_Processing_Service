import prisma from "../config/prisma.config.js";
import bcryptjs from "bcryptjs";
import logger from "../utils/logger.js";

const seedAdmin = async () => {
  const adminData = {
    username: "admin1",
    email: "BxR5M@example.com",
    password: "Admin@1234",
    role: "ADMIN",
  };

  const adminData2 = {
    username: "admin2",
    email: "7Mh2T@example.com",
    password: "Admin@1234",
    role: "ADMIN",
  };

  const admin = await prisma.user.create({
    data: {
      username: adminData.username,
      email: adminData.email,
      role: adminData.role,
    },
  });
};
