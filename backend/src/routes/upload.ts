import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadImageBuffer } from '../services/imageService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const uploadResult = await uploadImageBuffer(req.file.buffer);

    res.status(200).json({
      success: true,
      url: uploadResult.url,
      public_id: uploadResult.publicId,
    });
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed',
      error: error.message || error,
    });
  }
});

export default router;
