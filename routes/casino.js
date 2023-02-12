const express = require('express')
const router = express.Router()

const {
    createTable,
    getAllTables,
    getTable,
    updateTable,
    deleteTable,   
    getALlBets,
    getBet,
    placeBet,
    clearBets,
    doubleBets,
    repeatBets,
    totalBets
} = require('../controllers/casino')

router.route('/tables/').get(getAllTables).post(createTable)
router.route('/tables/:id').get(getTable).patch(updateTable).delete(deleteTable)
router.route('/bets/').post(getALlBets)
router.route('/bets/:id').get(getBet)
router.route('/bets/placeBet').post(placeBet)
router.route('/bets/clear').post(clearBets)
router.route('/bets/double').post(doubleBets)
router.route('/bets/repeat').post(repeatBets)
router.route('/bets/total').post(totalBets)

module.exports = router