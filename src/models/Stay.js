import mongoose from 'mongoose';

const staySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['tents', 'villas', 'cottages'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  maxGuests: {
    type: Number,
    required: true,
  },
  description: String,
  amenities: [String],
  images: [String],
  specialNotes: String,
}, { timestamps: true });

export default mongoose.models.Stay || mongoose.model('Stay', staySchema);
