import { ListBucketsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "node:path";
import fs from "fs";

const S3 = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_URL!,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
})

function getContentType(fileName: string) {
    const ext = path.extname(fileName).toLocaleLowerCase();
    const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpg",
        ".mp4": "video/mp4",
        ".pdf": "application/pdf",
        ".webp": "image/webp",
        ".gif": "image/gif",
    };
    return mimeTypes[ext] ?? "application/octet-stream";
}

export const UploadFile = async (localfilePath: string, destinationKey?: string) => {
    const fileName = path.basename(localfilePath)
    const fileBuffer = fs.readFileSync(localfilePath);
    const contentType = getContentType(fileName);

    const key = destinationKey ?? fileName;
    const command = new PutObjectCommand({
        Bucket: "bucket1",
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });
    const result = await S3.send(command);
    console.log(`File upload successfull ${fileName}`)
    return result;
}

console.log(await S3.send(new ListBucketsCommand({})));