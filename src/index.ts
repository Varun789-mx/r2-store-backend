import express from "express";
import { uptime } from "node:process";
import { upload } from "./middleware/multer";
import fs from "fs";
import { prisma } from "./utils/db";
import { nanoid } from "nanoid";
import path from "node:path";
import { GetUrl, UploadFile } from "./utils/aws";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        uptime: uptime().toLocaleString(),
        msg: "Hello world",
    });
});

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const userId = "1";
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: "file not found in request",
            });
        }
        let cloudinaryurl = await UploadFile(file.path);
        if (!cloudinaryurl) {
            return res.status(500).json({ error: "File upload failed" });
        }
        const addToDb = await prisma.asset.create({
            data: {
                key: path.basename(file.path),
                short_url: nanoid(6),
                authorId: userId
            },
            select: {
                key: true,
                short_url: true,
            }
        });
        if (!addToDb) {
            return res.status(500).json({
                error: "Failed to add asset to db",
            })
        }
        fs.unlinkSync(file.path);
        return res.status(200).json({
            success: true,
            short_url: `${process.env.BACKEND_URL}/download/?short_id=${addToDb.short_url}`,
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/download", async (req, res) => {
    try {
        const short_id = req.query.short_id as string;
        if (!short_id) {
            return res.status(400).json({
                error: "Invalid inputs",
            });
        }
        const record = await prisma.asset.findFirst({
            where: {
                short_url: short_id,
            },
            select: {
                key: true,
                timeStamp: true,
                downloads: true,
            },
        });
        if (!record || !record.key) {
            return res.status(404).json({
                error: "assest doesn't exist",
            });
        }
        const StorageURl = await GetUrl(record.key);
        console.log(StorageURl, "URL");
        const cloudResponse = await fetch(StorageURl);
        if (!cloudResponse.ok || !cloudResponse.body) {
            return res.status(500).json({ error: "Failed to fetch the asset" });
        }
        const filename = path.basename(record?.key);

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader(
            "Content-Type",
            cloudResponse.headers.get("content-type") ||
            "application/octet-stream",
        );

        await prisma.asset.updateMany({
            where: { short_url: short_id },
            data: { downloads: { increment: 1 } },
        });
        const { Readable } = await import("stream");
        Readable.fromWeb(cloudResponse.body as any).pipe(res);
    } catch (error) {
        return res.status(500).json({
            error: "Interal server error" + error,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
