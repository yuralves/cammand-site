var util = require('util');
var express = require('express');
var db = require('../../srv/exports/mongo');

var router = express.Router();
var debug = require('debug')('crud');

var BSON = require('mongodb');

String.prototype.normalize = function () {
    return this
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèẽêë]/g, 'e')
        .replace(/[íìĩîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùũûü]/g, 'u')
        .replace(/[ÁÀÂÃÄ]/g, 'A')
        .replace(/[ÉÈẼÊË]/g, 'E')
        .replace(/[ÍÌĨÎÏ]/g, 'I')
        .replace(/[ÓÒÕÔÖ]/g, 'O')
        .replace(/[ÚÙŨÛÜ]/g, 'U')
        .replace(/[ç]/g, 'c')
        .replace(/[Ç]/g, 'C')
        .replace(/[ñ]/g, 'n')
        .replace(/[Ñ]/g, 'N')
        .replace(/["''_\-\+\*\!\@\#\$\%\&\§\º\ª\{\}°ºª§\r\t,\.\]\[\(\)\/\\\|\?]/g, ' ')
        .replace(/  +/, ' ')
        .trim();
};

var _form = function(form) {
    var resp={};
    for(var key in form) {
        if(key==='headers') {
            continue;
        } if(key.startsWith('_id')) {
            resp[key] = new BSON.ObjectID(form[key]);
        } else if(key.startsWith('string')) {
            resp[key] = form[key].normalize().toUpperCase();
        } else if(key.startsWith('int')) {
            resp[key] = parseInt(form[key],10);
        } else if(key.startsWith('float')) {
            resp[key] = parseFloat(form[key]);
        } else if(key.startsWith('date')) {
            resp[key] = new Date(form[key]);
        } else {
            resp[key] = form[key];
        }
    }
    return resp;
};

router.use(function(req,res,next) {
    // get collection name from url request
    var name = req.originalUrl.replace(/^\/[0-9]+\/([a-zA-Z]+).*/,'$1');
        
    debug('get connection:' + name);
    req.collection = db.get().collection(name);
    next();
});

router.get('/', function(req,res) {
    req.collection.find({})
    .toArray(function(err,docs) {
        if(err) {
            debug(util.inspect(err, false, null));
            res.status(500).send(err);
        } else {
            debug(util.inspect(docs, false, null));
            res.json(docs);
            res.end();
        }
    });
});

router.post('/', function(req, res) {
    req.collection.insert(_form(req.body), {safe:true},function(err,docs) {
        if(err) {
            debug(util.inspect(err, false, null));
            res.status(500).send(err);
        } else {
            debug(util.inspect(docs, false, null));
            res.send(docs);
        }
    });
});

router.get('/:_id', function(req,res) {
    req.collection.findOne(_form(req.params),function(err,docs) {
        if(err) {
            debug(util.inspect(err, false, null));
            res.status(500).send(err);
        } else {
            debug(util.inspect(docs, false, null));
            res.send(docs);
        }
    });
});

router.put('/:_id', function(req,res) {
    req.collection.update(_form(req.params), _form(req.body), {sage:true},function(err,docs) {
        if(err) {
            debug(util.inspect(err, false, null));
            res.status(500).send(err);
        } else {
            res.send(req.body);
        }
    });
});

router.delete('/:_id', function(req,res) {
    
    req.collection.remove(_form(req.params),function(err,docs) {
        if(err) {
            debug.error(util.inspect(err, false, null));
            res.status(500).send(err);
        } else {
            res.send('');
        }
    });
});

module.exports = router;