import { hashPassword, comparePassword } from "./PasswordService.js";
import { generateToken } from "./TokenService.js";
import { getConfig } from "../config/initAuth.js";

export async function registerUser({ password, ...rest }) {
  const { userModel } = getConfig();

  const passwordHash = await hashPassword(password);

  return userModel.create({
    ...rest,
    password: passwordHash,
  });
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { userModel, roleField } = getConfig();

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user._id,
    role: user[roleField],
  });

  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;

  return { user: safeUser, token };
}
