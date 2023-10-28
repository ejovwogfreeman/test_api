const mongoose = require('mongoose')

const SupportSchema = new mongoose.Schema({
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    support: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Support', SupportSchema)