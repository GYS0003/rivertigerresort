import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
