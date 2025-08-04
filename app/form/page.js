'use client' 

import { useState, useRef } from 'react' 
import HCaptcha from '@hcaptcha/react-hcaptcha' 

export default function FormPage() {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    field3: '',
    file: null,
  }) 

  const [uploading, setUploading] = useState(false) 
  const [captchaToken, setCaptchaToken] = useState(null) 
  const captchaRef = useRef(null) 

  const handleChange = (e) => {
    const { name, value, files } = e.target 
    if (name === 'file') {
      setFormData(prev => ({ ...prev, file: files[0] })) 
    } else {
      setFormData(prev => ({ ...prev, [name]: value })) 
    }
  } 

  const handleSubmit = async (e) => {
    e.preventDefault() 

    if (!captchaToken) {
      alert('Please complete the CAPTCHA') 
      return 
    }

    if (!formData.file) {
      alert('Please select a file') 
      return 
    }

    setUploading(true) 

    const fileForm = new FormData() 
    fileForm.append('file', formData.file) 

    const uploadRes = await fetch('/api/imgUpload', {
      method: 'POST',
      body: fileForm,
    }) 

    if (!uploadRes.ok) {
      setUploading(false) 
      alert('File upload failed') 
      return 
    }

    const { url } = await uploadRes.json() 

    const res = await fetch('/api/storeData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field1: formData.field1,
        field2: formData.field2,
        field3: formData.field3,
        fileUrl: url,
        captcha: captchaToken,
      }),
    }) 

    const result = await res.json() 
    alert(result.message) 

    setFormData({ field1: '', field2: '', field3: '', file: null }) 
    setCaptchaToken(null) 
    captchaRef.current?.resetCaptcha() 
    setUploading(false) 

  } 

  return (
    <div className='bg-[#f0eeea] h-vh flex justify-center p-4 text-gray-900'>
      <div className='w-[42rem]'>
        <div className='rounded-lg bg-[url(/ambassador.png)] w-full h-44 bg-cover'></div>

        <div className='rounded-lg bg-white overflow-hidden my-4'>
          <div className='h-2 bg-purple-900'></div>
          <div className='p-4 grid gap-4'>
            <h1 className='text-3xl'>Week X Submission Form</h1>
            <p className=''>description goes here</p>
          </div>

        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className='grid gap-4'>
          <div className='rounded-lg grid gap-4 px-6 py-4 bg-white'>
            <label className='flex gap-1'>What is your X/Twitter handle?<span className='text-red-500 text-xl'>*</span></label>
            <input name="field1" className='border-b border-gray-300 pb-2 w-1/2 focus:ring-0 outline-none focus:border-purple-900 transition-all duration-300' placeholder="Your answer" value={formData.field1} onChange={handleChange} required />
          </div>

          <div className='rounded-lg grid gap-4 px-6 py-4 bg-white'>
            <label className='flex gap-1'>1 short tweet about Modulo<span className='text-red-500 text-xl'>*</span></label>
            <input name="field2" className='border-b border-gray-300 pb-2 w-1/2 focus:ring-0 outline-none focus:border-purple-900 transition-all duration-300' placeholder="Your answer" value={formData.field2} onChange={handleChange} required />
          </div>

          <div className='rounded-lg grid gap-4 px-6 py-4 bg-white'>
            <label className='flex gap-1'>1 tweet thread about Modulo<span className='text-red-500 text-xl'>*</span></label>
            <input name="field3" className='border-b border-gray-300 pb-2 w-1/2 focus:ring-0 outline-none focus:border-purple-900 transition-all duration-300' placeholder="Your answer" value={formData.field3} onChange={handleChange} required />
          </div>

          <input className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-purple-800 file:text-white hover:file:bg-purple-600 transition-all duration-300' name="file" type="file" accept="image/*" onChange={handleChange} required/>

          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
            onVerify={setCaptchaToken}
            ref={captchaRef}
          />

          <button className='bg-purple-800 text-white p-2 px-6 rounded-lg place-self-start text-sm' type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  ) 
}