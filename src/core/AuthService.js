import { hashPassword, comparePassword } from "./PasswordService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./TokenService.js";
import { getConfig } from "../config/initAuth.js";
import { createError, ERROR } from "../utils/AppError.js";
import crypto from "crypto";

// REGISTER
export async function registerUser({ password, ...rest }) {
  const { userModel } = getConfig();

  if (!password || password.length < 6) {
    throw createError({
      message: "Password must be at least 6 characters",
      statusCode: 400,
      code: "WEAK_PASSWORD",
    });
  }


  if (!rest.email) {
    throw createError({
      message: "Email is required",
      statusCode: 400,
      code: "MISSING_FIELDS",
    });
  }

  rest.email = rest.email.toLowerCase().trim();

  const passwordHash = await hashPassword(password);

  const user = await userModel.create({
    ...rest,
    password: passwordHash,
    isVerified: false,
  });

  // send verification email
  try {
    await sendVerificationEmail(user);
  } catch {}

  return user;
}

// LOGIN
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createError({
      message: "Email and password required",
      statusCode: 400,
      code: "MISSING_FIELDS",
    });
  }

  email = email.toLowerCase().trim();

  const { userModel, roleField, requireEmailVerification } = getConfig();

  const user = await userModel.findOne({ email });
  if (!user) throw createError(ERROR.INVALID_CREDENTIALS);

  if (requireEmailVerification && !user.isVerified) {
    throw createError({
      message: "Email not verified",
      statusCode: 403,
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw createError(ERROR.INVALID_CREDENTIALS);

  const payload = {
    userId: user._id,
    role: user[roleField],
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;

  return { user: safeUser, accessToken, refreshToken };
}

// REFRESH TOKEN
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw createError({
      message: "Refresh token required",
      statusCode: 401,
      code: "REFRESH_TOKEN_REQUIRED",
    });
  }

  try {
    const { userModel } = getConfig();

    const decoded = verifyRefreshToken(refreshToken);

    const user = await userModel.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw createError({
        message: "Invalid refresh token",
        statusCode: 401,
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    const payload = {
      userId: decoded.userId,
      role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);

    return { accessToken: newAccessToken };
  } catch {
    throw createError({
      message: "Invalid refresh token",
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
    });
  }
}

/**
 * Forgot Password
 */
export async function forgotPassword(email) {
  if (!email) {
    throw createError({
      message: "Email is required",
      statusCode: 400,
      code: "MISSING_FIELDS",
    });
  }

  email = email.toLowerCase().trim();

  const { userModel, resetTokenExpiry, resetPasswordUrl, mailService } =
    getConfig();

  if (!mailService) {
    throw createError({
      message: "Mail service not configured",
      statusCode: 500,
      code: "MAIL_SERVICE_MISSING",
    });
  }

  if (!resetPasswordUrl) {
    throw createError({
      message: "Reset password URL not configured",
      statusCode: 500,
      code: "RESET_URL_MISSING",
    });
  }

  const user = await userModel.findOne({ email });

  // 🔐 Security: don't reveal user existence
  if (!user) {
    return { message: "If account exists, reset email sent" };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + resetTokenExpiry;

  await user.save();

  const resetURL = `${resetPasswordUrl}/${rawToken}`;

  try {
    await mailService.sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <h3>Password Reset</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires soon.</p>
      `,
    });
  } catch (error) {}

  return { message: "If account exists, reset email sent" };
}

/**
 * Reset Password
 */
export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw createError({
      message: "Token and new password are required",
      statusCode: 400,
      code: "MISSING_FIELDS",
    });
  }

  if (newPassword.length < 6) {
    throw createError({
      message: "Password must be at least 6 characters",
      statusCode: 400,
      code: "WEAK_PASSWORD",
    });
  }

  const { userModel } = getConfig();

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw createError({
      message: "Invalid or expired token",
      statusCode: 400,
      code: "INVALID_RESET_TOKEN",
    });
  }

  user.password = await hashPassword(newPassword);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: "Password reset successful" };
}

export async function sendVerificationEmail(user) {
  const { mailService, verifyEmailUrl, verifyTokenExpiry } = getConfig();

  if (!mailService || !verifyEmailUrl) {
    throw createError({
      message: "Email verification not configured",
      statusCode: 500,
      code: "VERIFY_CONFIG_MISSING",
    });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.emailVerifyToken = hashedToken;
  user.emailVerifyExpires = Date.now() + verifyTokenExpiry;

  await user.save();

  const verifyURL = `${verifyEmailUrl}/${rawToken}`;

  try {
    await mailService.sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h3>Email Verification</h3>
        <p>Click below to verify your account:</p>
        <a href="${verifyURL}">${verifyURL}</a>
      `,
    });
  } catch (error) {}
}

export async function verifyEmail(token) {
  const { userModel } = getConfig();

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw createError({
      message: "Invalid or expired verification token",
      statusCode: 400,
      code: "INVALID_VERIFY_TOKEN",
    });
  }

  user.isVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;

  await user.save();

  return { message: "Email verified successfully" };
}

export async function resendVerification(email) {
  if (!email) {
    throw createError({
      message: "Email is required",
      statusCode: 400,
      code: "MISSING_FIELDS",
    });
  }

  email = email.toLowerCase().trim();

  const { userModel } = getConfig();

  const user = await userModel.findOne({ email });

  if (!user) {
    return { message: "If account exists, email sent" };
  }

  if (user.isVerified) {
    throw createError({
      message: "Email already verified",
      statusCode: 400,
      code: "ALREADY_VERIFIED",
    });
  }

  await sendVerificationEmail(user);

  return { message: "Verification email sent" };
}
