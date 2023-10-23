const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    socketId: {
        type: String,
        required: true,
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('users', userSchema);