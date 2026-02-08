import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded, remove it from local server
    console.log("File uploaded to Cloudinary successfully");
    fs.unlinkSync(localFilePath)
    return response;

    
  } catch (error) {
    fs.unlinkSync(localFilePath); //delete the file from local storage in case of error
    return null;
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    const publicId = imageUrl
      .split("/")
      .pop()
      .split(".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary successfully");
    return response;
  } catch (error) {    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };

// cloudinary.v2.uploader
//   .upload("sample.jpg")
//   .then((result) => console.log(result));
