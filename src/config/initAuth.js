let config = null;

export function initAuth(options) {
  if (!options?.jwtSecret) {
    throw new Error("authlite-express: jwtSecret is required");
  }

  if (!options?.userModel) {
    throw new Error("authlite-express: userModel is required");
  }

  config = {
    jwtSecret: options.jwtSecret,
    userModel: options.userModel,
    roleField: options.roleField || "role",

    refreshSecret: options.refreshSecret || options.jwtSecret,
    accessTokenExpiry: options.accessTokenExpiry || "15m",
    refreshTokenExpiry: options.refreshTokenExpiry || "7d",

    resetTokenExpiry: options.resetTokenExpiry || 15 * 60 * 1000,
    resetPasswordUrl: options.resetPasswordUrl,

    mailService: options.mailService,

    verifyTokenExpiry: options.verifyTokenExpiry || 24 * 60 * 60 * 1000,
    verifyEmailUrl: options.verifyEmailUrl,
    requireEmailVerification: options.requireEmailVerification || false,
  };
}

export function getConfig() {
  if (!config) {
    throw new Error("authlite-express not initialized. Call initAuth()");
  }
  return config;
}
