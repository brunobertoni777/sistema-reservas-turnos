const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../../infrastructure/database/repositories/UserRepository");

function generateToken(user) { return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" }); }

async function registerUser({ email, password, name }) {
  if (await UserRepository.findByEmail(email)) throw new Error("Email ya registrado.");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserRepository.create({ email, passwordHash, name });
  return { user, token: generateToken(user) };
}
async function loginUser({ email, password }) {
  const user = await UserRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error("Credenciales inválidas.");
  return { user, token: generateToken(user) };
}
module.exports = { registerUser, loginUser };