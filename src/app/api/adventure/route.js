// app/api/adventure/route.js
import { NextResponse } from 'next/server';
import Adventure from '@/models/Adventure';
import { connectDB } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.PROD_CLOUDINARY_NAME,
  api_key: process.env.PROD_CLOUDINARY_API_KEY,
  api_secret: process.env.PROD_CLOUDINARY_API_SECRET,
  secure: true
});

// GET: Fetch all adventures
export async function GET() {
  await connectDB();
  try {
    const adventures = await Adventure.find().sort({ createdAt: -1 });
    return NextResponse.json(adventures, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch adventures' }, { status: 500 });
  }
}

// POST: Create a new adventure
export async function POST(req) {
  await connectDB();
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const pricePerPerson = formData.get('pricePerPerson');
    const imageFile = formData.get('image');

    if (!name || !description || !pricePerPerson ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = '';
    if (imageFile && imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'chakrata-adventures' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      imageUrl = result.secure_url;
    }

    const newAdventure = await Adventure.create({
      name,
      description,
      pricePerPerson: Number(pricePerPerson),
      image: imageUrl
    });

    return NextResponse.json(newAdventure, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create adventure', error: error.message }, { status: 400 });
  }
}

// PUT: Update adventure by ID
export async function PUT(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Adventure ID is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const pricePerPerson = formData.get('pricePerPerson');
    const imageFile = formData.get('image');
    const deleteImage = formData.get('deleteImage') === 'true';

    // Get existing adventure
    const existingAdventure = await Adventure.findById(id);
    if (!existingAdventure) {
      return NextResponse.json({ message: 'Adventure not found' }, { status: 404 });
    }

    let imageUrl = existingAdventure.image;
    
    // Handle image deletion
    if (deleteImage && existingAdventure.image) {
      const publicId = existingAdventure.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`chakrata-adventures/${publicId}`);
      imageUrl = '';
    }
    
    // Upload new image if provided
    if (imageFile && imageFile instanceof File) {
      // Delete existing image if it exists
      if (existingAdventure.image) {
        const publicId = existingAdventure.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`chakrata-adventures/${publicId}`);
      }
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'chakrata-adventures' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      imageUrl = result.secure_url;
    }

    const updatedAdventure = await Adventure.findByIdAndUpdate(id, {
      name,
      description,
      pricePerPerson: Number(pricePerPerson),
      image: imageUrl
    }, { new: true });

    return NextResponse.json(updatedAdventure, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update adventure', error: error.message }, { status: 400 });
  }
}

// DELETE: Delete adventure by ID
export async function DELETE(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Adventure ID is required' }, { status: 400 });
    }

    const adventure = await Adventure.findById(id);
    if (!adventure) {
      return NextResponse.json({ message: 'Adventure not found' }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (adventure.image) {
      const publicId = adventure.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`chakrata-adventures/${publicId}`);
    }

    await Adventure.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Adventure deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete adventure', error: error.message }, { status: 500 });
  }
}