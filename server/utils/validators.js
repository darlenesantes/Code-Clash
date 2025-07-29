const validateRoomCode = (roomCode) => {
  if (!roomCode) {
    return {
      valid: false,
      error: 'Room code is required'
    };
  }

  if (typeof roomCode !== 'string') {
    return {
      valid: false,
      error: 'Room code must be a string'
    };
  }

  if (roomCode.length !== 6) {
    return {
      valid: false,
      error: 'Room code must be exactly 6 characters'
    };
  }

  if (!/^[A-Z0-9]+$/.test(roomCode)) {
    return {
      valid: false,
      error: 'Room code must contain only uppercase letters and numbers'
    };
  }

  return { valid: true };
};

const validateDifficulty = (difficulty) => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  if (!difficulty) {
    return {
      valid: false,
      error: 'Difficulty is required'
    };
  }

  if (!validDifficulties.includes(difficulty.toLowerCase())) {
    return {
      valid: false,
      error: `Difficulty must be one of: ${validDifficulties.join(', ')}`
    };
  }

  return { valid: true };
};

const validateLanguage = (language) => {
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
  
  if (!language) {
    return {
      valid: false,
      error: 'Programming language is required'
    };
  }

  if (!supportedLanguages.includes(language.toLowerCase())) {
    return {
      valid: false,
      error: `Language must be one of: ${supportedLanguages.join(', ')}`
    };
  }

  return { valid: true };
};

const validateCode = (code) => {
  if (!code) {
    return {
      valid: false,
      error: 'Code is required'
    };
  }

  if (typeof code !== 'string') {
    return {
      valid: false,
      error: 'Code must be a string'
    };
  }

  if (code.trim().length === 0) {
    return {
      valid: false,
      error: 'Code cannot be empty'
    };
  }

  if (code.length > 50000) {
    return {
      valid: false,
      error: 'Code is too long (maximum 50,000 characters)'
    };
  }

  return { valid: true };
};

const validateProfileData = (profileData) => {
  const errors = [];

  if (profileData.avatarTheme) {
    const validThemes = ['gamer', 'coder', 'genius', 'champion', 'cyborg', 'ninja'];
    if (!validThemes.includes(profileData.avatarTheme)) {
      errors.push(`Avatar theme must be one of: ${validThemes.join(', ')}`);
    }
  }

  if (profileData.avatarColor) {
    const validColors = ['red', 'blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'cyan'];
    if (!validColors.includes(profileData.avatarColor)) {
      errors.push(`Avatar color must be one of: ${validColors.join(', ')}`);
    }
  }

  if (profileData.skillLevel) {
    const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validSkillLevels.includes(profileData.skillLevel)) {
      errors.push(`Skill level must be one of: ${validSkillLevels.join(', ')}`);
    }
  }

  if (profileData.favoriteLanguages) {
    if (!Array.isArray(profileData.favoriteLanguages)) {
      errors.push('Favorite languages must be an array');
    } else if (profileData.favoriteLanguages.length > 5) {
      errors.push('Maximum 5 favorite languages allowed');
    }
  }

  if (profileData.goals) {
    if (!Array.isArray(profileData.goals)) {
      errors.push('Goals must be an array');
    } else if (profileData.goals.length > 10) {
      errors.push('Maximum 10 goals allowed');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateSessionId = (sessionId) => {
  if (!sessionId) {
    return {
      valid: false,
      error: 'Session ID is required'
    };
  }

  if (typeof sessionId !== 'string') {
    return {
      valid: false,
      error: 'Session ID must be a string'
    };
  }

  if (!sessionId.startsWith('session_')) {
    return {
      valid: false,
      error: 'Invalid session ID format'
    };
  }

  return { valid: true };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  return { valid: true };
};

const validateUsername = (username) => {
  if (!username) {
    return {
      valid: false,
      error: 'Username is required'
    };
  }

  if (typeof username !== 'string') {
    return {
      valid: false,
      error: 'Username must be a string'
    };
  }

  if (username.length < 2) {
    return {
      valid: false,
      error: 'Username must be at least 2 characters long'
    };
  }

  if (username.length > 30) {
    return {
      valid: false,
      error: 'Username must be less than 30 characters'
    };
  }

  // Allow letters, numbers, spaces, and some special characters
  if (!/^[a-zA-Z0-9\s._-]+$/.test(username)) {
    return {
      valid: false,
      error: 'Username contains invalid characters'
    };
  }

  return { valid: true };
};

module.exports = {
  validateRoomCode,
  validateDifficulty,
  validateLanguage,
  validateCode,
  validateProfileData,
  validateSessionId,
  validateEmail,
  validateUsername,
  sanitizeInput
};