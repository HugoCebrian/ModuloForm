import { v2 as cloudinary } from 'cloudinary' 
import formidable from 'formidable' 
import fs from 'fs/promises' 

export const config = {
  api: {
    bodyParser: false,
  },
} 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}) 

export default async function handler(req, res) {
  const { IncomingForm } = await import('formidable') 
  const form = new IncomingForm() 

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Upload failed' }) 

    const file = files.file?.[0] 
    const data = await fs.readFile(file.filepath) 

    const uploadRes = await cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ message: 'Cloudinary error' }) 
        return res.status(200).json({ url: result.secure_url }) 
      }
    ) 

    const { Readable } = await import('stream') 
    Readable.from(data).pipe(uploadRes) 
  }) 
}