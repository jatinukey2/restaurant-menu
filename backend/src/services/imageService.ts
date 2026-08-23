import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param buffer File buffer to upload
 * @returns Promise resolving to secure URL and public ID
 */
export const uploadImageBuffer = (buffer: Buffer): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant-menu',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload result is empty'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Extracts Cloudinary public ID from a secure URL
 * @param url Cloudinary secure image URL
 * @returns public ID (including folder) or null
 */
export const extractPublicId = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;

    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const pathParts = parts.slice(uploadIndex + 1);
    
    // Skip version segment (e.g., 'v12345678')
    if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
      pathParts.shift();
    }
    
    const fullPathWithExt = pathParts.join('/');
    const lastDotIndex = fullPathWithExt.lastIndexOf('.');
    if (lastDotIndex === -1) return fullPathWithExt;
    
    return fullPathWithExt.substring(0, lastDotIndex);
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Destroys an image on Cloudinary using its public ID
 * @param publicId Cloudinary public ID of the resource
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image '${publicId}' from Cloudinary:`, error);
    throw error;
  }
};

/**
 * Destroys an image on Cloudinary using its image URL
 * @param url Cloudinary secure image URL
 */
export const deleteImageByUrl = async (url: string): Promise<any> => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  return await deleteImage(publicId);
};
