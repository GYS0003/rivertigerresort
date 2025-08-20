const mongoose = require('mongoose');

const StayOfflineBookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  stayType: {
    type: String,
    required: [true, 'Stay type is required'], // e.g., 'Villa', 'Cottage', 'Tent'
    enum: ['Villa', 'Cottage', 'Tent'],
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
  },
  adults: {
    type: Number,
    required: [true, 'Number of adults is required'],
    min: 1,
  },
  children: {
    type: Number,
    default: 0,
    min: 0,
  },
  numberOfRooms: {
    type: Number,
    required: [true, 'Number of rooms is required'],
    min: 1,
  },
  roomNumbers: {
    type: [String], // array of strings like ["101", "102A"]
    default: [],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'Success'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.models.StayOfflineBooking || mongoose.model('StayOfflineBooking', StayOfflineBookingSchema);
