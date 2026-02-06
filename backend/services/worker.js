import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sendEmail } from "./emailService.js";
import NotificationLog from "../models/NotificationLog.js";

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
    const messageId = msg.MessageId;

    let logs = await NotificationLog.findOne({ messageId });

    if (!logs) {
      logs = await NotificationLog.create({
        messageId,
        eventType: JSON.parse(msg.Body).type,
        email: JSON.parse(msg.Body).email,
        status: "PENDING",
        attempts: 1,
      });
    } else {
      logs.attempts += 1;
      await logs.save();
    }

    const data = JSON.parse(msg.Body);

    try {
      if (data.type === "SIGNUP") {
        await sendEmail(data.email, "Welcome 🎉", "Thanks for signing up!");
      }

      if (data.type === "LOGIN") {
        await sendEmail(data.email, "Login Alert", "You just logged in.");
      }
      logs.status = "SENT";
      await logs.save();

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle,
        }),
      );
    } catch (err) {
      logs.status = "FAILED";
      logs.error = err.message;
      await logs.save();
      console.error("Worker error:", err.message);
    }
  }
}

async function startWorker() {
  while (true) {
    await pollQueue();
  }
}

startWorker();
