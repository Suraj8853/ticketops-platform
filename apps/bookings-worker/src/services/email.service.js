const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const logger = require('../utils/logger');
 
const ses = new SESClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const FROM = process.env.SES_FROM_EMAIL || 'noreply@ticketops.com';
 
const sendConfirmationEmail = async ({ customer_email, customer_name, booking_ref, event_title, seats, qr_url }) => {
  const params = {
    Source: FROM,
    Destination: { ToAddresses: [customer_email] },
    Message: {
      Subject: {
        Data: `Booking Confirmed — ${event_title} | ${booking_ref}`,
      },
      Body: {
        Html: {
          Data: `
            <h2>Your booking is confirmed!</h2>
            <p>Hi ${customer_name},</p>
            <p>Your tickets for <strong>${event_title}</strong> are confirmed.</p>
            <p><strong>Booking Ref:</strong> ${booking_ref}</p>
            <p><strong>Seats:</strong> ${seats.join(', ')}</p>
            <p><a href="${qr_url}">Download your QR code</a></p>
            <p>See you at the event!</p>
            <p>— TicketOps Team</p>
          `,
        },
      },
    },
  };
 
  await ses.send(new SendEmailCommand(params));
  logger.info({ message: 'confirmation email sent', booking_ref, customer_email });
};
 
module.exports = { sendConfirmationEmail };
