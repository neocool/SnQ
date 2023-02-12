const express = require('express')
const router = express.Router()


const {
  checkCookie,
} = require('../controllers/auth')

router.route('/checkCookie').get(checkCookie)


module.exports = router