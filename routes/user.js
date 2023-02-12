const { application } = require('express')
const express = require('express')
const router = express.Router()
const rateLimiter = require('express-rate-limit')
const {
  getAllUsers,
  getUser,
  registerUser,
  login,
  logout,
  updateUser,
  deleteUser,
  twoFactorAuth,
  disableDFA
} = require('../controllers/user')

//middleware
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 1 hour
  max: 15,
  message: "Too many login attempts. Please try again later."
});

router.route('/').get(getAllUsers)
router.route('/getDFA').get(twoFactorAuth)
router.route('/disableDFA').get(disableDFA)
router.route('/user').get(getUser)
router.route('/register').post(loginLimiter,registerUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
router.route('/logout').post(logout)
router.route('/login').post(loginLimiter,login)

module.exports = router