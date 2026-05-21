const prisma = require("../prismaClient");
const UserRepository = {
  async findByEmail(email) { return prisma.user.findUnique({ where: { email } }); },
  async create({ email, passwordHash, name }) { return prisma.user.create({ data: { email, passwordHash, name, role: "CLIENT" } }); },
  async findById(id) { return prisma.user.findUnique({ where: { id } }); }
};
module.exports = UserRepository;