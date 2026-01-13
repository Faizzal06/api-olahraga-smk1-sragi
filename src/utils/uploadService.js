/**
 * Upload Service
 * Service untuk upload dan delete gambar ke Cloudinary
 */
const cloudinary = require('../config/cloudinary');

/**
 * Upload gambar ke Cloudinary
 * @param {Object} file - File object dari multer (buffer)
 * @param {String} folder - Folder tujuan di Cloudinary (optional)
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImage = async (file, folder = 'activity-proofs') => {
    try {
        // Convert buffer ke base64 data URI
        const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64Data, {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 1024, height: 1024, crop: 'limit' }, // Limit max size
                { quality: 'auto:good' }, // Auto optimize quality
                { fetch_format: 'auto' } // Auto format (webp/avif when supported)
            ]
        });

        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Gagal mengupload gambar ke Cloudinary');
    }
};

/**
 * Delete gambar dari Cloudinary
 * @param {String} publicId - Public ID gambar di Cloudinary
 * @returns {Promise<{result: string}>}
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Don't throw error for delete failures (non-critical)
        return { result: 'error' };
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
