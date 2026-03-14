import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage"
import path from "node:path";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Url } from "node:url";

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

export const GetUrl = async (ImageKey: string) => {
    return getSignedUrl(S3,
        new GetObjectCommand({ Bucket: "bucket1", Key: ImageKey }), { expiresIn: 3600 }
    )
}


export const UploadFile = async (localfilePath: string, destinationKey?: string) => {
    const fileName = path.basename(localfilePath)
    const contentType = getContentType(fileName);
    const key = destinationKey ?? fileName;


    const upload = new Upload({
        client: S3,
        params: {
            Bucket: "bucket1",
            Key: key,
            Body: createReadStream(localfilePath),
            ContentType: contentType,
        },
        partSize: 1024 * 1024 * 10
    });
    const result = await upload.done();
    console.log(`File upload successfull ${fileName}`)
    return result;
}