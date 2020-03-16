// srv/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var passportLocalMongooose = require("passport-local-mongoose");

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email               : { type: String, required: true, unique: true },
        password            : { type: String, required: true, unique: false },
        userType           : { type: String, required: true, unique: false },
        resetPasswordToken  : String,
        resetPasswordExpires: Date
    }//,
    // facebook         : {
    //     id           : String,
    //     token        : String,
    //     email        : String,
    //     name         : String
    // },
    // twitter          : {
    //     id           : String,
    //     token        : String,
    //     displayName  : String,
    //     username     : String
    // },
    // google           : {
    //     id           : String,
    //     token        : String,
    //     email        : String,
    //     name         : String
    // }

});

userSchema.plugin(passportLocalMongooose, {
    usernameField: "local.email"
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);