import { connectDB } from '@/lib/db';
import Stay from '@/models/Stay';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.PROD_CLOUDINARY_NAME,
  api_key: process.env.PROD_CLOUDINARY_API_KEY,
  api_secret: process.env.PROD_CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const listOnly = searchParams.get('list');

  if (listOnly === 'true') {
    const list = await Stay.find({}, { _id: 1, category: 1, maxGuests: 1, name: 1 });
    return Response.json(list);
  }

  if (id) {
    const stay = await Stay.findById(id);
    return Response.json(stay);
  }

  const all = await Stay.find();
  return Response.json(all);
}

export async function POST(req) {
  await connectDB();
  const formData = await req.formData();

  const data = Object.fromEntries(formData.entries());
  const images = formData.getAll('images');

  const uploadedImages = [];
  for (const image of images) {
    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'chakrata-stays' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedImages.push(result.secure_url);
    }
  }

  const stayData = {
    ...data,
    price: Number(data.price),
    maxGuests: Number(data.maxGuests),
    breakfastPrice: Number(data.breakfastPrice || 0),
    lunchPrice: Number(data.lunchPrice || 0),
    dinnerPrice: Number(data.dinnerPrice || 0),
    amenities: data.amenities ? data.amenities.split(',') : [],
    images: uploadedImages,
  };

  const stay = await Stay.create(stayData);
  return Response.json({ success: true, stay });
}

export async function PUT(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  const formData = await req.formData();
  const data = Object.fromEntries(formData.entries());
  const images = formData.getAll('images') || [];
  const deleteImages = formData.getAll('deleteImages') || [];

  // Handle image deletions from Cloudinary
  if (deleteImages.length > 0) {
    await Promise.all(
      deleteImages.map(publicId => cloudinary.uploader.destroy(publicId))
    );
  }

  // Upload new images if any
  const uploadedImages = [];
  if (images.length > 0 && images[0] instanceof File) {
    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'chakrata-stays' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedImages.push(result.secure_url);
    }
  }

  const existingStay = await Stay.findById(id);
  const existingImages = existingStay.images.filter(
    img => !deleteImages.some(delImg => img.includes(delImg))
  );

  const stayData = {
    ...data,
    price: Number(data.price),
    maxGuests: Number(data.maxGuests),
    breakfastPrice: Number(data.breakfastPrice || 0),
    lunchPrice: Number(data.lunchPrice || 0),
    dinnerPrice: Number(data.dinnerPrice || 0),
    amenities: data.amenities ? data.amenities.split(',') : [],
    images: [...existingImages, ...uploadedImages],
  };

  const updated = await Stay.findByIdAndUpdate(id, stayData, { new: true });
  return Response.json({ success: true, updated });
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  // Delete associated images from Cloudinary
  const stay = await Stay.findById(id);
  if (stay.images?.length > 0) {
    await Promise.all(
      stay.images.map(image => {
        const publicId = image.split('/').pop().split('.')[0];
        return cloudinary.uploader.destroy(`chakrata-stays/${publicId}`);
      })
    );
  }

  await Stay.findByIdAndDelete(id);
  return Response.json({ success: true, message: 'Deleted successfully' });
}
