import express from "express"
import dotenv from "dotenv";
import { uptime } from "node:process";
import { upload } from "./middleware/multer";
import UploadOnCloudinary from "./utility/cloudnairy";
dotenv.config()
import fs from "fs";


const PORT = process.env.PORT || 5000;

const app = express();


app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        uptime: uptime().toLocaleString(),
        msg: "Hello world",
    })
})

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: "file not found in request",
            })
        }
        let cloudinaryurl = await UploadOnCloudinary(file.path);
        if (!cloudinaryurl) {
            return res.status(500).json({ error: "File upload failed" });
        }
        console.log("Cloudinary url", cloudinaryurl);
        fs.unlinkSync(file.path);
        return res.status(200).json({ success: true, });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }
})



app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
}) 