const mongoose = require('mongoose');

const ResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '10min' } // Token expires in 10 mins
});

const ResetToken = mongoose.model('ResetToken', ResetTokenSchema);

module.exports = ResetToken;
