import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Automatically detect file type (e.g. image, video, etc.)
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { url: result.secure_url };
  } catch (error) {
    // Attempt to delete the file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Error uploading to Cloudinary:', error.message);
    throw new Error('Cloudinary upload failed');
  }
};

export default uploadCloudinary;
