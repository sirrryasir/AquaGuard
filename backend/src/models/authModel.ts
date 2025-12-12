import { prisma } from '../config/prisma.js';

export const createUser = async (email: string, password: string, fullName: string) => {
  return await prisma.user.create({
    data: {
      email,
      password,
      fullName,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};