import express from "express";
import { uptime } from "node:process";
import UploadRoute from "./routes/upload"
import DownloadRoute from "./routes/download";
import Getlinks from "./routes/getlinks"
import cors from "cors";
import { prisma } from "./utils/db";
import cookieparser from "cookie-parser";
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(cookieparser())
// app.use(requireAuth);

app.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        uptime: uptime().toLocaleString(),
        msg: "Hello world",
    });
});
app.use(async (req, res, next) => {
    try {
        let userId = req.cookies?.anon_id;
        if (!userId) {
            userId = crypto.randomUUID()

            await prisma.user.create({
                data: {
                    userId: userId
                }
            })
            res.cookie("anon_id", userId, {
                httpOnly: true,
                sameSite: "none",
                secure: true
            })
            return res.json({ message: "New user created succesfully" })
        } else {
            const userExists = await prisma.user.findUnique({
                where: {
                    userId: userId
                }, select: {
                    assets: true,
                }
            })
            if (!userExists) {
                await prisma.user.create({
                    data: { userId: userId }
                })
            }
            req.userId = userId;
            next();
        }
    } catch (error) {
        return res.status(500).json({ Error: "user initialization failed" })
    }
})
app.use("/api", UploadRoute);
app.use("/api", DownloadRoute);
app.use("/api", Getlinks);



app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
    