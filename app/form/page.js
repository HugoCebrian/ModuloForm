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

    // Step 1: Upload image
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

    // Step 2: Submit full form with CAPTCHA and file URL
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
    <div className='bg-gray-800 m-8 p-8'>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className='grid gap-4'>
        <input name="field1" className='bg-gray-200 rounded-lg text-gray-700 px-4 py-2' placeholder="Name" value={formData.field1} onChange={handleChange} required />
        <input name="field2" className='bg-gray-200 rounded-lg text-gray-700 px-4 py-2' placeholder="Discord Handle" value={formData.field2} onChange={handleChange} required />
        <input name="field3" className='bg-gray-200 rounded-lg text-gray-700 px-4 py-2' placeholder="Wallet" value={formData.field3} onChange={handleChange} required />
        <input name="file" type="file" accept="image/*" onChange={handleChange} required />


        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
          onVerify={setCaptchaToken}
          ref={captchaRef}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  ) 
}