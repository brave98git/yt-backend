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
    response.url();
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //delete the file from local storage in case of error
    return null;
  }
};

export { uploadToCloudinary };

// cloudinary.v2.uploader
//   .upload("sample.jpg")
//   .then((result) => console.log(result));
