import { prisma } from '../config/prisma.js';
export const createUser = async (email, password, fullName) => {
    return await prisma.user.create({
        data: {
            email,
            password,
            fullName,
        },
    });
};
export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
};
//# sourceMappingURL=authModel.js.map