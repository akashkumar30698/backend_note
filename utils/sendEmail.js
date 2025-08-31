import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: false,
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});


export async function sendOtpEmail(to, code) {
const info = await transporter.sendMail({
from: process.env.FROM_EMAIL || 'no-reply@notesapp.local',
to,
subject: 'Your OTP Code',
text: `Your OTP is ${code}. It expires in 10 minutes.`,
html: `<p>Your OTP is <b>${code}</b>. It expires in <b>10 minutes</b>.</p>`
});
return info;
}