import dotenv from "dotenv";
dotenv.config
import { v2 as cloudinary } from "cloudinary";

import fs from "fs";


const UploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) {
            return null;
        }
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            upload_preset: 'ml_default',
        })
        return response.url;
    } catch (error) {
        console.log("Cloudinary upload error", error)
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export default UploadOnCloudinary;