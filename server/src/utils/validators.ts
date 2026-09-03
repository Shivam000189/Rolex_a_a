export const validateName = (name: string): string | null => {
  if (!name || name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.length < 8 || password.length > 16) {
    return "Password must be between 8 and 16 characters";
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasUpperCase) {
    return "Password must contain at least one uppercase letter";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character";
  }
  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address || address.length > 400) {
    return "Address must not exceed 400 characters";
  }
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (!rating || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }
  return null;
};