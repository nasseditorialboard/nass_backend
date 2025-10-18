const cloudinary = require("./cloudinaryConfig"); // Import your Cloudinary config

class Utils {
  static async upload(fileBuffer, folder = "uploads") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: folder, // Default folder
          public_id: `img-${Date.now()}`, // Unique public ID
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}

module.exports = Utils;
