import { google } from 'googleapis' 
import fetch from 'node-fetch' 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end() 

  try {
    const { field1, field2, field3, field4, field5, field6, fileUrl, captcha } = req.body 

    const captchaRes = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: captcha
      })
    }) 

    const captchaData = await captchaRes.json() 
    if (!captchaData.success) return res.status(400).json({ message: 'Invalid CAPTCHA' }) 

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    }) 

    await auth.authorize() 

    const sheets = google.sheets({ version: 'v4', auth }) 
    
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[field1, field2, field3, field4, field5, field6, fileUrl]]
        }
      }) 

      return res.status(200).json({ message: 'Submitted successfully!' }) 
    } catch (sheetsError) {
      console.error('Sheets API Error:', sheetsError) 
      return res.status(500).json({ 
        message: 'Failed to update spreadsheet',
        error: sheetsError.message 
      }) 
    }

  } catch (error) {
    console.error('Handler Error:', error) 
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    }) 
  }
}