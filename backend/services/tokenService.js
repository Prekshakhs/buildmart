const jwt = require("jsonwebtoken");

const tokenService = {
  generateTokens: async (userId, role, user) => {
    const accessToken = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );

    const refreshToken = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenEntry = {
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: refreshTokenExpiry,
    };

    user.refreshTokens.push(refreshTokenEntry);
    await user.save();

    return {
      accessToken,
      refreshToken,
      refreshTokenId: refreshTokenEntry._id,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    };
  },

  validateAccessToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  },

  validateRefreshToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  },

  revokeToken: async (userId, refreshToken, User) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const decoded = jwt.decode(refreshToken);
    const tokenToRevoke = user.refreshTokens.find(
      (t) => t.expiresAt && new Date(t.expiresAt).getTime() === new Date(decoded.exp * 1000).getTime()
    );

    if (tokenToRevoke) {
      tokenToRevoke.revokedAt = new Date();
    }

    await user.save();
  },

  revokeAllTokens: async (userId, User) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.refreshTokens = user.refreshTokens.map((token) => ({
      ...token,
      revokedAt: new Date(),
    }));

    await user.save();
  },

  refreshAccessToken: async (refreshToken, User) => {
    const decoded = tokenService.validateRefreshToken(refreshToken);
    if (!decoded) throw new Error("Invalid refresh token");

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    const tokenEntry = user.refreshTokens.find(
      (t) => !t.revokedAt && new Date(t.expiresAt) > Date.now()
    );

    if (!tokenEntry) throw new Error("Refresh token revoked or expired");

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );

    user.lastActive = new Date();
    await user.save();

    return {
      accessToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    };
  },

  isTokenRevoked: async (userId, refreshToken, User) => {
    const user = await User.findById(userId);
    if (!user) return true;

    const decoded = jwt.decode(refreshToken);
    const tokenEntry = user.refreshTokens.find(
      (t) => t.expiresAt && new Date(t.expiresAt).getTime() === new Date(decoded.exp * 1000).getTime()
    );

    return !tokenEntry || !!tokenEntry.revokedAt || new Date(tokenEntry.expiresAt) < Date.now();
  },
};

module.exports = tokenService;
