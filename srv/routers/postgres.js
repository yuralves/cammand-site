var express = require('express');
var debug = require('debug')('postgres');
var util = require('util');
var router = express.Router();

// http://localhost:3000/
router.get('/', function(req, res, next) {
    res.status(200)
      .json({
        status: 'success',
        message: 'Live long and prosper!'
      });
});


//////////////////////
// Postgres queries
//////////////////////

var db = require('./queries');

router.get('/getDocumentTypes', db.getDocumentTypes);
router.post('/checkin', db.checkin);
router.post('/charge', db.charge);
router.post('/getBalance', db.balance);
router.post('/getQRbalance', db.QRbalance);
router.post('/checkOut', db.checkOut);
router.get('/getItems', db.getItems);
router.post('/createItem', db.createItem);

// router.get('/clientsWallet/:id', db.getClientsPosition);
// router.get('/dailyPosition', db.getDailyPosition);
// router.get('/dailyWallet', db.getDailyWallet);
// router.get('/dailyB100', db.getDailyB100);
// router.get('/parcels', db.getParcels);
// router.post('/createMarkets', db.createMarkets);

/*router.get('/starships', db.getAllStarships);
router.get('/starships/:id', db.getStarship);
router.post('/starships', db.createStarship);
router.put('/starships/:id', db.updateStarship);
router.delete('/starships/:id', db.removeStarship);*/

module.exports = router;

//ALL LOVE FOR THIS GUY
//https://github.com/jorditost/node-postgres-restapi