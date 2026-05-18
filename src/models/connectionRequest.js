const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['interested', 'ignored', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests between the same two users
connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Feed query performance indexes
connectionRequestSchema.index({ receiver: 1, status: 1 });
connectionRequestSchema.index({ sender: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
