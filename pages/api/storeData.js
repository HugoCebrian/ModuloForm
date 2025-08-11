import { google } from 'googleapis';

// Next.js already provides fetch on the server; no need for node-fetch
// import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { field1, field2, field3, field4, field5, field6, fileUrl, captcha } = req.body;

    if (!captcha) {
      return res.status(400).json({ message: 'Missing CAPTCHA token' });
    }
    if (!process.env.HCAPTCHA_SECRET && !process.env.HCAPTCHA_SECRET_KEY) {
      return res.status(500).json({ message: 'Server missing hCaptcha secret env var' });
    }

    // Use the correct secret var (support both names just in case)
    const SECRET = process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_SECRET_KEY;

    const verifyBody = new URLSearchParams({
      secret: SECRET,
      response: captcha,
      // You can also pass "sitekey" and "remoteip" if desired
    });

    const captchaRes = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody,
    });

    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      // Log the reason server-side and return it to you for debugging
      console.error('hCaptcha verification failed:', captchaData);
      return res.status(400).json({
        message: 'Invalid CAPTCHA',
        reason: captchaData['error-codes'] || null,
      });
    }

    // ---- Google Sheets append ----
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    // You’re sending 7 fields; point range to 7+ columns (or just 'Sheet1')
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1', // simpler; Google will append on the next row
      valueInputOption: 'RAW',
      requestBody: {
        values: [[field1, field2, field3, field4, field5, field6, fileUrl]],
      },
    });

    return res.status(200).json({ message: 'Submitted successfully!' });
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
}