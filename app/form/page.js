'use client'

import { useForm } from 'react-hook-form'
import { useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const fields = [
  { name: 'field1', label: 'What is your X/Twitter handle?', placeholder: 'Your answer' },
  { name: 'field2', label: '1 short tweet about Modulo', placeholder: 'Your answer' },
  { name: 'field3', label: '1 tweet thread about Modulo', placeholder: 'Your answer' },
  { name: 'field4', label: 'Comment on 3 @ModuloLabs posts', placeholder: 'Provide the links to your comments' },
  { name: 'field5', label: 'Retweet 3 @ModuloLabs posts', placeholder: 'Provide the links to the posts' },
  { name: 'field6', label: 'Like 3 @ModuloLabs posts', placeholder: 'Provide the links to the posts' },
]

export default function FormPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm()

  const [uploading, setUploading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const captchaRef = useRef(null)

  const file = watch('file')

  const onSubmit = async (data) => {
    if (!captchaToken) {
      alert('Please complete the CAPTCHA')
      return
    }

    if (!data.file?.[0]) {
      alert('Please select a file')
      return
    }

    setUploading(true)

    try {
      const fileForm = new FormData()
      fileForm.append('file', data.file[0])

      const uploadRes = await fetch('/api/imgUpload', {
        method: 'POST',
        body: fileForm,
      })

      if (!uploadRes.ok) throw new Error('File upload failed')
      const { url } = await uploadRes.json()

      const res = await fetch('/api/storeData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fileUrl: url,
          captcha: captchaToken,
        }),
      })

      const result = await res.json()
      alert(result.message)
      reset()
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    } catch (err) {
      console.error(err)
      alert('Submission failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='bg-[#f0eeea] min-h-screen flex justify-center p-4 text-gray-900'>
      <div className='w-[42rem]'>
        <div className='rounded-lg bg-[url(/ambassador.png)] w-full h-44 bg-cover'></div>

        <div className='rounded-lg bg-white overflow-hidden my-4'>
          <div className='h-2 bg-[#564be2]'></div>
          <div className='p-4 grid gap-4'>
            <h1 className='text-3xl'>Week 10 Submission Form</h1>
            <p>Submit your tasks below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4' encType="multipart/form-data">
          {fields.map(({ name, label, placeholder }) => (
            <div key={name} className='rounded-lg grid gap-2 px-6 py-4 bg-white'>
              <label className='flex gap-1'>
                {label}
                <span className='text-red-500 text-xl'>*</span>
              </label>
              <input
                {...register(name, { required: true })}
                placeholder={placeholder}
                className='border-b border-gray-300 pb-2 w-1/2 focus:ring-0 outline-none focus:border-purple-900 transition-all duration-300'
              />
              {errors[name] && <span className='text-sm text-red-500'>This field is required</span>}
            </div>
          ))}

          <div className='px-6 py-4 bg-white rounded-lg'>
            <input
              {...register('file', { required: true })}
              type="file"
              accept="image/*"
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-[#564be2] file:text-sm file:bg-[#564be2] hover:file:text-[#564be2] file:text-white hover:file:bg-[#c8c5f5] file:transition-all file:duration-300'
            />
            {errors.file && <span className='text-sm text-red-500'>Please upload a file</span>}
          </div>

          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
            onVerify={setCaptchaToken}
            ref={captchaRef}
          />

          <button
            type="submit"
            className='bg-[#564be2] text-white p-2 px-6 rounded-md place-self-start text-sm disabled:opacity-50'
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}