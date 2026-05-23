const loginAttempts = new Map();

const rateLimitService = {
  checkLoginAttempt: (email, ip) => {
    const key = `${email}:${ip}`;
    const attempt = loginAttempts.get(key);

    if (attempt && attempt.lockedUntil > Date.now()) {
      throw new Error("Account locked. Please try again later.");
    }

    if (attempt && attempt.count >= 5) {
      attempt.lockedUntil = Date.now() + 30 * 60 * 1000;
      loginAttempts.set(key, attempt);
      throw new Error("Too many failed attempts. Account locked for 30 minutes.");
    }

    return true;
  },

  recordFailedAttempt: (email, ip) => {
    const key = `${email}:${ip}`;
    const attempt = loginAttempts.get(key) || {
      count: 0,
      firstAttempt: Date.now(),
      lockedUntil: null,
    };

    attempt.count += 1;
    attempt.lastAttempt = Date.now();

    if (attempt.count >= 5) {
      attempt.lockedUntil = Date.now() + 30 * 60 * 1000;
    }

    loginAttempts.set(key, attempt);

    setTimeout(() => {
      if (loginAttempts.has(key)) {
        const current = loginAttempts.get(key);
        if (current.lastAttempt && Date.now() - current.lastAttempt > 15 * 60 * 1000) {
          loginAttempts.delete(key);
        }
      }
    }, 15 * 60 * 1000);
  },

  recordSuccessfulLogin: (email, ip) => {
    const key = `${email}:${ip}`;
    loginAttempts.delete(key);
  },

  getAttempts: (email, ip) => {
    const key = `${email}:${ip}`;
    return loginAttempts.get(key) || null;
  },

  clearAttempts: (email, ip) => {
    const key = `${email}:${ip}`;
    loginAttempts.delete(key);
  },

  isLocked: (email, ip) => {
    const key = `${email}:${ip}`;
    const attempt = loginAttempts.get(key);
    return attempt && attempt.lockedUntil && attempt.lockedUntil > Date.now();
  },

  getLockTimeRemaining: (email, ip) => {
    const key = `${email}:${ip}`;
    const attempt = loginAttempts.get(key);
    if (!attempt || !attempt.lockedUntil) return 0;

    const remaining = attempt.lockedUntil - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  },

  cleanup: () => {
    const now = Date.now();
    for (const [key, attempt] of loginAttempts.entries()) {
      if (
        attempt.lastAttempt &&
        now - attempt.lastAttempt > 15 * 60 * 1000 &&
        (!attempt.lockedUntil || attempt.lockedUntil < now)
      ) {
        loginAttempts.delete(key);
      }
    }
  },
};

setInterval(() => rateLimitService.cleanup(), 60 * 1000);

module.exports = rateLimitService;
