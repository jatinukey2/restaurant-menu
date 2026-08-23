import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Upload buffer to Cloudinary using a stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant-menu',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary Upload Error:', error);
          res.status(500).json({ success: false, message: 'Cloudinary upload failed', error });
          return;
        }
        res.status(200).json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
