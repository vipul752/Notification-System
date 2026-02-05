import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sendEmail } from "./emailService.js";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

async function pollQueue() {
  const res = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    }),
  );

  if (!res.Messages) return;

  for (const msg of res.Messages) {
    const data = JSON.parse(msg.Body);

    try {
      if (data.type === "SIGNUP") {
        await sendEmail(data.email, "Welcome 🎉", "Thanks for signing up!");
      }

      if (data.type === "LOGIN") {
        await sendEmail(data.email, "Login Alert", "You just logged in.");
      }

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle,
        }),
      );
    } catch (err) {
      console.error("Worker error:", err.message);
    }
  }
}

setInterval(pollQueue, 5000);
