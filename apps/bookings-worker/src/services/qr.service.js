const QRCode = require('qrcode');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const BUCKET = process.env.AWS_S3_BUCKET || 'ticketops-qr-codes';

// generate QR code PNG buffer from booking data
const generateQR = async (bookingData) => {
  const qrContent = JSON.stringify({
    ref: bookingData.booking_ref,
    event: bookingData.event_title,
    seats: bookingData.seats,
  });
  // returns a PNG buffer
  const buffer = await QRCode.toBuffer(qrContent, { type: 'png', width: 300 });
  return buffer;
};

// upload QR PNG to S3 and return pre-signed URL
const uploadQR = async (bookingRef, qrBuffer) => {
  const key = `qr-codes/${bookingRef}.png`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: qrBuffer,
    ContentType: 'image/png',
  }));

  logger.info({ message: 'QR uploaded to S3', booking_ref: bookingRef, key });

  // generate pre-signed URL valid for 7 days
  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }), { expiresIn: 7 * 24 * 60 * 60 });

  return url;
};

module.exports = { generateQR, uploadQR };
