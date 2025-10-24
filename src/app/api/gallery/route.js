import { connectDB } from '@/lib/db';
import Gallery from '@/models/Gallery';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.PROD_CLOUDINARY_NAME,
  api_key: process.env.PROD_CLOUDINARY_API_KEY,
  api_secret: process.env.PROD_CLOUDINARY_API_SECRET,
  secure: true,
});

// GET - Fetch all gallery images
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const enabledOnly = searchParams.get('enabled');
    
    const filter = enabledOnly === 'true' ? { enabled: true } : {};
    
    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: images,
      count: images.length,
    }, { status: 200 });
    
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message,
    }, { status: 500 });
  }
}

// POST - Upload new image to Cloudinary and save to DB
export async function POST(req) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided',
      }, { status: 400 });
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'gallery',
      resource_type: 'auto',
    });
    
    // Save to database
    const newImage = await Gallery.create({
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      enabled: true,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: newImage,
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    }, { status: 500 });
  }
}

// PATCH - Toggle enable/disable
export async function PATCH(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Image ID is required',
      }, { status: 400 });
    }
    
    const body = await req.json();
    const { enabled } = body;
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'enabled field must be a boolean',
      }, { status: 400 });
    }
    
    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { enabled },
      { new: true, runValidators: true }
    );
    
    if (!updatedImage) {
      return NextResponse.json({
        success: false,
        message: 'Image not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Image ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: updatedImage,
    }, { status: 200 });
    
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update image',
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE - Remove from Cloudinary and DB
export async function DELETE(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Image ID is required',
      }, { status: 400 });
    }
    
    const image = await Gallery.findById(id);
    
    if (!image) {
      return NextResponse.json({
        success: false,
        message: 'Image not found',
      }, { status: 404 });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Delete from database
    await Gallery.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    }, { status: 200 });
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    }, { status: 500 });
  }
}
