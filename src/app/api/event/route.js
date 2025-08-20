import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



// Validate Cloudinary config
if (!process.env.PROD_CLOUDINARY_NAME || 
    !process.env.PROD_CLOUDINARY_API_KEY || 
    !process.env.PROD_CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.PROD_CLOUDINARY_NAME,
  api_key: process.env.PROD_CLOUDINARY_API_KEY,
  api_secret: process.env.PROD_CLOUDINARY_API_SECRET,
});



const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } finally {
    try {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    } catch (unlinkErr) {
      console.error('Error deleting temp file:', unlinkErr);
    }
  }
};

// GET (all or by ID)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await connectDB();

    if (id) {
      const event = await Event.findById(id);
      if (!event) return Response.json({ message: 'Event not found' }, { status: 404 });
      return Response.json(event);
    }

    const events = await Event.find().sort({ createdAt: -1 });
    return Response.json(events);
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST (create event)
export async function POST(req) {
  try {
    await connectDB();
    const formDatas = await req.formData();
    const title = formDatas.get('title');
    const description = formDatas.get('description');
    const capacity = formDatas.get('capacity');
    const startingPrice = formDatas.get('startingPrice');
    const imageFile = formDatas.get('image');
    
    let imageUrl = '';
    if (imageFile && imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'events' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      imageUrl = result.secure_url;
    }

    const newEvent = await Event.create({
      title: title,
      description: description,
      image: imageUrl,
      capacity: Number(capacity),
      startingPrice: Number(startingPrice),
    });

    return Response.json(newEvent);
  } catch (err) {
    console.error(err);
    return Response.json({ 
      message: err.name === 'ValidationError' 
        ? 'Invalid input data' 
        : 'Server error' 
    }, { status: 500 });
  }
}

// PUT (update event)
export async function PUT(req) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return Response.json({ message: 'ID required' }, { status: 400 });
  
      await connectDB();
  
      const formDatas = await req.formData();
      const title = formDatas.get('title');
      const description = formDatas.get('description');
      const capacity = formDatas.get('capacity');
      const startingPrice = formDatas.get('startingPrice');
      const imageFile = formDatas.get('image');
      const oldImage = formDatas.get('oldImage');
  
      let imageUrl = oldImage || '';
  
      // ⬇️ Only upload if file exists and is non-empty
      if (imageFile instanceof File && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
  
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'events' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
  
        imageUrl = result.secure_url;
      }
  
      const updated = await Event.findByIdAndUpdate(
        id,
        {
          title,
          description,
          capacity: Number(capacity),
          startingPrice: Number(startingPrice),
          image: imageUrl,
        },
        { new: true, runValidators: true }
      );
  
      if (!updated) return Response.json({ message: 'Event not found' }, { status: 404 });
      return Response.json(updated);
    } catch (err) {
      console.error(err);
      return Response.json({
        message: err.name === 'ValidationError'
          ? 'Invalid input data'
          : 'Server error',
      }, { status: 500 });
    }
  }
  
// DELETE (delete event)
export async function DELETE(req) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return Response.json({ message: 'ID required' }, { status: 400 });
  
      await connectDB();
  
      const event = await Event.findById(id);
      if (!event) return Response.json({ message: 'Event not found' }, { status: 404 });
  
      // Delete image from Cloudinary if exists
      if (event.image) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = extractPublicId(event.image);
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.warn('Cloudinary image deletion failed:', cloudErr.message);
        }
      }
  
      // Delete event from MongoDB
      await Event.findByIdAndDelete(id);
  
      return Response.json({ message: 'Event deleted successfully' });
    } catch (err) {
      console.error(err);
      return Response.json({ message: 'Server error' }, { status: 500 });
    }
  }
  
  // Extract Cloudinary public ID from URL
  function extractPublicId(imageUrl) {
    const parts = imageUrl.split('/');
    const folderIndex = parts.findIndex(p => p === 'upload') + 1;
    const publicPath = parts.slice(folderIndex).join('/'); // events/filename.jpg
    const publicId = publicPath.replace(/\.[^/.]+$/, ''); // remove file extension
    return publicId;
  }
  