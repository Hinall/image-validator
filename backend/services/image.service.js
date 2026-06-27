import prisma from "../src/lib/prisma.js";

export const createImage = async (imageData) => {
  return await prisma.image.create({
    data: imageData,
  });
};

export const getAllImages = async () => {
  return await prisma.image.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};