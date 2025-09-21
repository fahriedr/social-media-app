import { HttpException } from "../models/http-exception";
import { createClient } from "@supabase/supabase-js";
import { SupabaseResponse } from "../models/post";
import prisma from "./prisma-client";

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', '']

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)


export const createSignedUrl = async (userId: number, postUniqueId: string, fileExt: string = "jpg"): Promise<SupabaseResponse> => {

    fileExt = fileExt.toLocaleLowerCase()

    if (!ALLOWED_EXTS.includes(fileExt)) {
        throw new HttpException(400, 'Unsupported file type')
    }

    const filePath = `/media/posts/${userId}/${postUniqueId}/${crypto.randomUUID()}.${fileExt}`

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .createSignedUploadUrl(filePath)
    
    if (error) throw error
    return { signedUrl: data.signedUrl, path: filePath }

}

export const deleteImage = async (postMediaId: number) => {

    const image = await prisma.post_media.findUnique({
        where: {
            id: postMediaId
        }
    })

    if (image) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).remove([image.link_url])

        await prisma.post_media.delete({
            where: {
                id: postMediaId
            }
        })

        return true
    } else {
        throw new HttpException(404, "Image not found")
    }


}

export const deletePostImages = async (postId: number) => {
    
    // Get Old images
    const old_images = await prisma.post_media.findMany({
        where: {
            post_id: postId
        }
    })

    // Delete from supabase storage
    await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).remove(old_images.map(img => img.link_url))

    // Delete image from DB
    await prisma.post_media.deleteMany({ where: { post_id: postId } })

    return true
}