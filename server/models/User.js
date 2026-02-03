import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { USER_ROLES, USER_VALIDATION, STORAGE_CONSTANTS, AUTH_CONSTANTS } from '../constants/User.js';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, USER_VALIDATION.FIRST_NAME_REQUIRED],
    trim: true,
    maxlength: [50, USER_VALIDATION.FIRST_NAME_MAXLENGTH]
  },
  lastName: {
    type: String,
    required: [true, USER_VALIDATION.LAST_NAME_REQUIRED],
    trim: true,
    maxlength: [50, USER_VALIDATION.LAST_NAME_MAXLENGTH]
  },
  email: {
    type: String,
    required: [true, USER_VALIDATION.EMAIL_REQUIRED],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      USER_VALIDATION.EMAIL_INVALID
    ]
  },
  password: {
    type: String,
    required: [true, USER_VALIDATION.PASSWORD_REQUIRED],
    minlength: [8, USER_VALIDATION.PASSWORD_MINLENGTH],
    select: false
  },
  username: {
    type: String,
    required: [true, USER_VALIDATION.USERNAME_REQUIRED],
    unique: true,
    trim: true,
    maxlength: [50, USER_VALIDATION.USERNAME_MAXLENGTH],
    match: [
      /^[a-zA-Z0-9_]+$/,
      USER_VALIDATION.USERNAME_INVALID
    ]
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: [USER_ROLES.USER, USER_ROLES.ADMIN],
    default: USER_ROLES.USER
  },
  storageUsed: {
    type: Number,
    default: 0
  },
  storageLimit: {
    type: Number,
    default: STORAGE_CONSTANTS.DEFAULT_LIMIT
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || AUTH_CONSTANTS.BCRYPT_ROUNDS_DEFAULT);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
