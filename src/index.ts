import dotenv from "dotenv";
dotenv.config();
import express from "express"
import { uptime } from "node:process";
import { upload } from "./middleware/multer";
// import UploadOnCloudinary from "./utility/cloudnairy";
import fs from "fs";
import { prisma } from "./utility/db";
import { nanoid } from "nanoid";
import path from "node:path";
import { UploadFile } from "./utility/aws";

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
        const userId = "123414";
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: "file not found in request",
            })
        }
        let cloudinaryurl = await UploadFile(file.path);
        if (!cloudinaryurl) {
            return res.status(500).json({ error: "File upload failed" });
        }
        // const addToDb = await prisma.link.create({
        //     data: {
        //         original_url: cloudinaryurl,
        //         short_url: nanoid(6),
        //     },
        //     select: {
        //         original_url: true,
        //         short_url: true,
        //     }
        // });
        // if (!addToDb) {
        //     return res.status(500).json({
        //         error: "Failed to add asset to db",
        //     })
        // }
        fs.unlinkSync(file.path);
        return res.status(200).json({
            success: true,
            // short_url: addToDb.short_url,
        })
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/download", async (req, res) => {
    try {
        const short_id = req.query.short_id as string;
        if (!short_id) {
            return res.status(400).json({
                error: "Invalid inputs",
            })
        }
        const record = await prisma.link.findFirst({
            where: {
                short_url: short_id,
            }, select: {
                original_url: true,
                timeStamp: true,
                downloads: true,
            }
        })
        if (!record || !record.original_url) {
            return res.status(404).json({
                error: "assest doesn't exist"
            })
        }
        const cloudnairyResponse = await fetch(record.original_url);
        if (!cloudnairyResponse.ok || !cloudnairyResponse.body) {
            return res.status(500).json({ error: "Failed to fetch the asset" })
        }
        const filename = path.basename(record?.original_url);

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", cloudnairyResponse.headers.get("content-type") || "application/octet-stream");

        await prisma.link.updateMany({
            where: { short_url: short_id },
            data: { downloads: { increment: 1 } }
        })
        const { Readable } = await import("stream");
        Readable.fromWeb(cloudnairyResponse.body as any).pipe(res);
    } catch (error) {
        return res.status(500).json({
            error: "Interal server error" + error
        })
    }
})


app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
}) 