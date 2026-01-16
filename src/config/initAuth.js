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
    tokenExpiry: options.tokenExpiry || "7d",
    userModel: options.userModel,
    roleField: options.roleField || "role",
  };
}

export function getConfig() {
  if (!config) {
    throw new Error("authlite-express not initialized. Call initAuth()");
  }
  return config;
}
