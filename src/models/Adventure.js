// models/Adventure.js
import mongoose from 'mongoose';

const adventureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String, // Store image URL or file path
    required: false
  },
  pricePerPerson: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Adventure || mongoose.model('Adventure', adventureSchema);
