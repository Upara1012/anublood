const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"AnuBlood Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

const sendRequestEmail = async (to, hospitalName, bloodType, units, message) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #dc2626;">New Blood Request</h2>
      <p><strong>${hospitalName}</strong> has sent a blood request to your hospital.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p><strong>Blood Type:</strong> ${bloodType}</p>
      <p><strong>Units Required:</strong> ${units}</p>
      <p><strong>Message:</strong> ${message || 'No message provided'}</p>
      <div style="margin-top: 20px;">
        <a href="${process.env.CLIENT_URL}/requests" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request</a>
      </div>
    </div>
  `;
  return sendEmail(to, `New Blood Request: ${bloodType}`, html);
};

const sendRequestResponseEmail = async (to, hospitalName, status, bloodType) => {
  const color = status === 'ACCEPTED' ? '#16a34a' : '#dc2626';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: ${color};">Blood Request Update</h2>
      <p>Your blood request for <strong>${bloodType}</strong> has been <strong>${status.toLowerCase()}</strong> by ${hospitalName}.</p>
      <div style="margin-top: 20px;">
        <a href="${process.env.CLIENT_URL}/requests" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
      </div>
    </div>
  `;
  return sendEmail(to, `Blood Request ${status}`, html);
};

const sendNewUserEmail = async (to, name, email, password, role) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #dc2626;">Welcome to AnuBlood</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been created on the AnuBlood system. Below are your login credentials:</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
      </div>
      <p>Please login and change your password for security.</p>
      <div style="margin-top: 20px;">
        <a href="${process.env.CLIENT_URL}/login" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
      </div>
    </div>
  `;
  return sendEmail(to, 'AnuBlood Account Created', html);
};

module.exports = {
  sendRequestEmail,
  sendRequestResponseEmail,
  sendNewUserEmail,
};
