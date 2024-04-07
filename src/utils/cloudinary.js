import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("Invalid file path");
      return;
    }

    const response = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" },
      function (error, result) {
        if (error) console.log(error);
        else console.log(result);
      }
    );

    //file has uploaded successfully
    // console.log("File uploaded successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
