export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const USER_VALIDATION = {
  FIRST_NAME_REQUIRED: 'Please provide first name',
  FIRST_NAME_MAXLENGTH: 'First name cannot be more than 50 characters',
  LAST_NAME_REQUIRED: 'Please provide last name',
  LAST_NAME_MAXLENGTH: 'Last name cannot be more than 50 characters',
  EMAIL_REQUIRED: 'Please provide email',
  EMAIL_INVALID: 'Please provide a valid email',
  PASSWORD_REQUIRED: 'Please provide password',
  PASSWORD_MINLENGTH: 'Password must be at least 8 characters',
  USERNAME_REQUIRED: 'Please provide username',
  USERNAME_MAXLENGTH: 'Username cannot be more than 50 characters',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores'
};

export const STORAGE_CONSTANTS = {
  DEFAULT_LIMIT: 5368709120 // 5GB in bytes
};

export const AUTH_CONSTANTS = {
  BCRYPT_ROUNDS_DEFAULT: 12
};