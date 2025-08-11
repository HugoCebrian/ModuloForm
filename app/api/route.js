export const runtime = 'nodejs' 

import crypto from 'crypto' 

export async function POST(req) {
  try {
    const { folder = 'my-app', public_id } = await req.json() 

    const timestamp = Math.floor(Date.now() / 1000) 

    const params = { folder, timestamp, ...(public_id ? { public_id } : {}) } 
    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&') 

    const signature = crypto
      .createHash('sha1')
      .update(toSign + process.env.CLOUDINARY_API_SECRET)
      .digest('hex') 

    return new Response(
      JSON.stringify({
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        public_id,
        timestamp,
        signature,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ) 
  } catch (err) {
    console.error(err) 
    return new Response(JSON.stringify({ message: 'Sign error' }), { status: 500 }) 
  }
}