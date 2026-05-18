const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }

  try {
    const { user, accessToken, refreshToken } = await authService.signup(req.body);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, 201, 'Account created successfully', { user, accessToken });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }

  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, 200, 'Logged in successfully', { user, accessToken });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return sendError(res, 401, 'Refresh token is missing');
  }

  try {
    const { accessToken, refreshToken } = await authService.refreshTokens(token);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, 200, 'Tokens refreshed', { accessToken });
  } catch (err) {
    return sendError(res, err.statusCode || 500, err.message);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.id);
    clearRefreshCookie(res);
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getMe = (req, res) => {
  return sendSuccess(res, 200, 'User fetched', { user: req.user });
};

module.exports = { signup, login, refresh, logout, getMe };
