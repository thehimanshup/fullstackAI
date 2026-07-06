import { NextResponse } from "next/server"
import { join } from "path"
import { createReadStream, statSync } from "fs"
import { ReadableOptions } from "stream"

// Helper to convert Node.js stream to Web stream
function streamFile(path: string, options?: ReadableOptions): ReadableStream {
    const downloadStream = createReadStream(path, options)
    return new ReadableStream({
        start(controller) {
            downloadStream.on("data", (chunk: string | Buffer) => {
                const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk
                controller.enqueue(new Uint8Array(buf))
            })
            downloadStream.on("end", () => controller.close())
            downloadStream.on("error", (error: Error) => controller.error(error))
        },
        cancel() {
            downloadStream.destroy()
        },
    })
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const filePath = searchParams.get("path")

        if (!filePath) {
            return new NextResponse("Missing path", { status: 400 })
        }

        // Base directory is the project root's 'Study material'
        const baseDir = join(process.cwd(), "Study material")
        const absolutePath = join(baseDir, filePath)

        // Basic path traversal prevention
        if (!absolutePath.startsWith(baseDir)) {
            return new NextResponse("Invalid path", { status: 403 })
        }

        const stat = statSync(absolutePath)
        const stream = streamFile(absolutePath)

        const filename = filePath.split("/").pop() || "download.pdf"

        return new NextResponse(stream as any, {
            headers: {
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Type": "application/pdf",
                "Content-Length": stat.size.toString(),
            },
        })
    } catch (error) {
        console.error("Download error:", error)
        return new NextResponse("File not found or access denied", { status: 404 })
    }
}
