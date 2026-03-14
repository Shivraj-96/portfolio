const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message, captchaToken } = req.body;

  // ── 1. Basic validation ──────────────────────────────────────
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // ── 2. Verify hCaptcha token ─────────────────────────────────
  try {
    const captchaRes = await axios.post(
      'https://hcaptcha.com/siteverify',
      new URLSearchParams({
        secret:   process.env.HCAPTCHA_SECRET,  // from .env
        response: captchaToken,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!captchaRes.data.success) {
      return res.status(400).json({ error: 'CAPTCHA verification failed.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'CAPTCHA check failed.' });
  }

  // ── 3. Send email via Nodemailer ─────────────────────────────
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // your Gmail address
        pass: process.env.EMAIL_PASS,  // Gmail App Password (not regular password)
      },
    });

    await transporter.sendMail({
      from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,   // sends to yourself
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong>    ${name}</p>
        <p><strong>Email:</strong>   ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;