const mongoose = require('mongoose');

let roomSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }]
},
{
    timestamps: true
});

module.exports = mongoose.model('rooms', roomSchema);