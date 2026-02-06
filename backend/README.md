# 🔔 Notification System - Backend

A robust, scalable notification system built with Node.js, Express, AWS SQS, and MongoDB. This system handles user authentication events (signup/login) and sends transactional emails asynchronously using a message queue architecture.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Setup & Installation](#-setup--installation)
- [Flow Diagrams](#-flow-diagrams)

---

## 🏗️ Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Express    │────▶│   AWS SQS   │────▶│   Worker    │
│  (Frontend) │     │   Server    │     │   Queue     │     │  (Polling)  │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                    ┌─────────────┐     ┌─────────────┐            │
                    │   MongoDB   │◀────│   Brevo     │◀───────────┘
                    │  (Logging)  │     │ (Email API) │
                    └─────────────┘     └─────────────┘
```

---

## ⚙️ How It Works

### Step-by-Step Flow

1. **Client Request**: User triggers a signup or login action from the frontend.

2. **API Receives Request**: The Express server receives the request at `/auth/signup` or `/auth/login`.

3. **Message Queued**: Instead of sending email directly (which would block the response), the server pushes a message to AWS SQS queue with the event type and user email.

4. **Instant Response**: The API immediately responds to the client with a success message (non-blocking).

5. **Worker Polls Queue**: A background worker continuously polls the SQS queue for new messages (long polling with 20-second wait).

6. **Email Sent**: When a message is received, the worker:
   - Creates/updates a log entry in MongoDB with status `PENDING`
   - Sends the appropriate email via Brevo (SendinBlue) API
   - Updates the log status to `SENT` on success or `FAILED` on error
   - Deletes the message from SQS queue after successful processing

7. **Logging**: All notification attempts are logged in MongoDB with:
   - Message ID, event type, recipient email
   - Status (PENDING/SENT/FAILED/DLQ)
   - Number of retry attempts
   - Error messages (if any)

### Why This Architecture?

| Benefit           | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| **Decoupled**     | Email sending is separated from the main API, improving reliability |
| **Scalable**      | Multiple workers can process the queue in parallel                  |
| **Resilient**     | Failed messages stay in queue for retry; nothing is lost            |
| **Fast Response** | Users get instant feedback; emails are sent in background           |
| **Auditable**     | Complete logging of all notification attempts                       |

---

## 📁 Project Structure

```
backend/
├── index.js                 # Application entry point
├── package.json             # Dependencies and scripts
├── README.md                # This file
│
├── auth/
│   └── auth.js              # Authentication routes (signup/login)
│
├── models/
│   ├── db.js                # MongoDB connection setup
│   └── NotificationLog.js   # Mongoose schema for notification logs
│
└── services/
    ├── emailService.js      # Brevo email sending logic
    ├── sqs.js               # AWS SQS client and message sending
    └── worker.js            # Background worker for queue processing
```

### File Responsibilities

| File                        | Purpose                                                                           |
| --------------------------- | --------------------------------------------------------------------------------- |
| `index.js`                  | Initializes Express server, middleware, routes, and starts the worker             |
| `auth/auth.js`              | Defines `/auth/signup` and `/auth/login` endpoints that queue notification events |
| `models/db.js`              | Establishes MongoDB connection using Mongoose                                     |
| `models/NotificationLog.js` | Defines the schema for tracking all notification attempts                         |
| `services/emailService.js`  | Wraps Brevo API for sending transactional emails                                  |
| `services/sqs.js`           | Wraps AWS SQS for sending messages to the queue                                   |
| `services/worker.js`        | Infinite loop that polls SQS, processes messages, and sends emails                |

---

## 🛠️ Tech Stack

| Technology             | Purpose                            |
| ---------------------- | ---------------------------------- |
| **Node.js**            | JavaScript runtime                 |
| **Express.js 5**       | Web framework for REST API         |
| **AWS SQS**            | Message queue for async processing |
| **MongoDB**            | Database for notification logs     |
| **Mongoose**           | MongoDB ODM                        |
| **Brevo (SendinBlue)** | Transactional email service        |
| **dotenv**             | Environment variable management    |

---

## 🔌 API Endpoints

### Health Check

```
GET /ping
```

**Response:** `pong`

---

### Signup

```
POST /auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Signup successful"
}
```

**Side Effect:** Queues a welcome email to the user.

---

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Login successful"
}
```

**Side Effect:** Queues a login alert email to the user.

---

### Test Route

```
GET /auth/test
```

**Response:** `API working`

---

## 🗃️ Database Schema

### NotificationLog

| Field       | Type            | Description                            |
| ----------- | --------------- | -------------------------------------- |
| `messageId` | String (unique) | SQS message ID for deduplication       |
| `eventType` | Enum            | `SIGNUP` or `LOGIN`                    |
| `email`     | String          | Recipient email address                |
| `status`    | Enum            | `PENDING`, `SENT`, `FAILED`, or `DLQ`  |
| `attempts`  | Number          | Number of processing attempts          |
| `provider`  | String          | Email provider used (default: "Brevo") |
| `error`     | String          | Error message if failed                |
| `createdAt` | Date            | Auto-generated timestamp               |
| `updatedAt` | Date            | Auto-generated timestamp               |

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=7777

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notifications

# AWS SQS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/notification-queue

# Brevo (SendinBlue) Email
BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- AWS account with SQS access
- Brevo (SendinBlue) account for emails

### Steps

1. **Clone the repository**

   ```bash
   cd NotificationSystem/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start the server**

   ```bash
   node index.js
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:7777/ping
   # Should return: pong
   ```

---

## 📊 Flow Diagrams

### Signup Flow

```
User                    API                     SQS                 Worker              Brevo
 │                       │                       │                    │                   │
 │──POST /auth/signup──▶│                       │                    │                   │
 │                       │──sendToQueue()──────▶│                    │                   │
 │                       │                       │                    │                   │
 │◀──201 "Signup ok"────│                       │                    │                   │
 │                       │                       │                    │                   │
 │                       │                       │◀──pollQueue()──────│                   │
 │                       │                       │──message──────────▶│                   │
 │                       │                       │                    │──sendEmail()────▶│
 │                       │                       │                    │◀──success────────│
 │                       │                       │◀──deleteMessage()──│                   │
 │                       │                       │                    │──log to MongoDB   │
```

### Worker Processing States

```
┌──────────────┐
│   Message    │
│   Received   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PENDING    │◀─────────────┐
│   (logged)   │              │
└──────┬───────┘              │
       │                      │
       ▼                      │
   Send Email            Retry (if in queue)
       │                      │
   ┌───┴───┐                  │
   ▼       ▼                  │
┌──────┐ ┌──────┐             │
│ SENT │ │FAILED│─────────────┘
└──────┘ └──────┘
```

---

## 📝 Email Templates

| Event  | Subject     | Content                |
| ------ | ----------- | ---------------------- |
| SIGNUP | Welcome 🎉  | Thanks for signing up! |
| LOGIN  | Login Alert | You just logged in.    |

---

## 🔄 Retry Mechanism

- Messages that fail to process remain in the SQS queue
- The `attempts` counter in MongoDB tracks retry count
- Configure SQS Dead Letter Queue (DLQ) for messages that fail repeatedly
- Status changes to `DLQ` when max retries exceeded

---

## 📈 Future Improvements

- [ ] Add more notification types (password reset, order confirmation)
- [ ] Implement SMS notifications (Twilio)
- [ ] Add push notifications (Firebase)
- [ ] Create admin dashboard for notification logs
- [ ] Add rate limiting per user
- [ ] Implement email templates with HTML
- [ ] Add webhook support for delivery status

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License

---

**Built with ❤️ using Node.js, AWS SQS, and Brevo**
