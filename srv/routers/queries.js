var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.POSTGRESQL_URI
var db = pgp(connectionString);

/////////////////////
// Query Functions
/////////////////////

function getDocumentTypes(req, res, next) {
  db.any('SELECT * FROM public.document_types;')
  .then(function(data) {
    res.status(200)
    .json({
      status: 'success',
      data: data,
      message: 'Retrieved all document types'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

function checkin(req, res, next) {
  db.one('INSERT INTO public.users (document_type_id, document, phone_number, full_name, balance) VALUES (${document_type_id}, ${document}, ${phone}, ${name}, 0) ON CONFLICT (phone_number) DO UPDATE SET document_type_id = ${document_type_id}, document = ${document}, full_name = ${name} RETURNING id;', req.body)
  .then(function (data) {
    console.log(data['id']);
    let queryString = 'SELECT merge_db(' + data['id'] + ', ' + req.body['number'] + ');';
    console.log(queryString);
    db.one(queryString).then(function () {
        res.status(200).json({
        data: data,
        status: 'success',
        message: 'Inserted'
        });
      }).catch(function (err) {
        console.log(err);
        return next(err);
      });
  })
  .catch(function (err) {
    return next(err);
  });
}

function charge(req, res, next) {
  db.none('UPDATE public.users SET balance = COALESCE(balance,0) + ${balance} WHERE id = (SELECT user_id FROM public.card_user WHERE is_active = TRUE AND card_id = ${id_number} ORDER BY id DESC LIMIT 1);', req.body)
  .then(function(data) {
    res.status(200)
    .json({
      status:'success',
      message:'updated successfully'
    })
  })
}

function balance(req, res, next) {
  console.log(req.body);
  db.one('SELECT MAX(balance) AS balance, phone_number FROM public.users u LEFT JOIN public.card_user cu ON u.id = cu.user_id where card_id = ${number} and is_active = true group by phone_number;', req.body)
  .then(function(data) {
    res.status(200)
    .json({
      status:'success',
      data: data,
      message:'updated successfully'
    })
  })
}

function QRbalance(req, res, next) {
  console.log(req.body);
  db.one('WITH card_table AS ( SELECT id, qr_code FROM public.cards WHERE qr_code = ${qrCode} ), card_user_table AS ( SELECT DISTINCT card_id, user_id FROM public.card_user WHERE card_id IN (SELECT id FROM card_table) and is_active = true ), user_table AS ( SELECT id, full_name, phone_number, COALESCE(balance,0) AS balance FROM public.users WHERE id IN (SELECT user_id FROM card_user_table) ) SELECT c.id::text, c.qr_code, coalesce(ut.full_name, \'Sem usuário\') as full_name, coalesce(ut.phone_number, \'Sem usuário\') as phone_number, coalesce(\'R$\' || ut.balance::text,\'Comanda inativa\') as balance FROM card_table c LEFT JOIN card_user_table cut ON c.id = cut.card_id LEFT JOIN user_table ut ON cut.user_id = ut.id UNION SELECT null as id, null as qr_code, \'QR Code inválido\' as full_name, \'QR Code inválido\' as phone_number, \'QR Code inválido\' as balance limit 1;', req.body)
  .then(function(data) {
    res.status(200)
    .json({
      status:'success',
      data: data,
      message:'updated successfully'
    })
  })
}

function checkOut(req, res, next) {
  console.log(req.body);
  db.none('UPDATE public.card_user SET is_active = FALSE WHERE card_id = (SELECT id FROM public.cards WHERE qr_code = ${qrCode} AND is_active = TRUE);', req.body)
  .then(function(data) {
    res.status(200)
    .json({
      status:'success',
      message:'updated successfully'
    })
  })  
}

function getItems(req, res, next) {
  db.any('SELECT * FROM public.items;')
  .then(function(data) {
    res.status(200)
    .json({
      status: 'success',
      data: data,
      message: 'Retrieved all document types'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

function createItem(req, res, next) {
  console.log(req.body);
  db.none('INSERT INTO public.items (name, description, price, is_active) VALUES (${name}, ${description}, ${price}, TRUE);', req.body)
  .then(function(data) {
    res.status(200)
    .json({
      status: 'success',
      message: 'Retrieved all document types'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

/////////////
// Exports
/////////////

module.exports = {
  getDocumentTypes: getDocumentTypes,
  checkin: checkin,
  charge: charge,
  balance: balance,
  QRbalance: QRbalance,
  checkOut: checkOut,
  getItems: getItems,
  createItem: createItem
    // getClientsPosition: getClientsPosition,
    // getDailyPosition: getDailyPosition,
    // getDailyWallet: getDailyWallet,
    // getDailyB100: getDailyB100,
    // getParcels: getParcels,
    // createMarkets: createMarkets
/*    getAllStarships: getAllStarships,
    getStarship: getStarship,
    createStarship: createStarship,
    updateStarship: updateStarship,
    removeStarship: removeStarship*/
};