import { prisma } from "../config/prismaClient.config.js";
const getUsersController = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const getUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser.password,
      ...deletedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export { getUsersController, getUserController, deleteUserController };
