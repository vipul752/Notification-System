import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export async function sendEmail(toEmail, subject, text) {
    await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.FROM_EMAIL,
        name: "Notification System",
      },
      to: [
        {
          email: toEmail,
        },
      ],
      subject,
      textContent: text,
    });

    // throw new Error("FORCED EMAIL FAILURE");
}
