# Standalone Express Mailer Backend

This folder contains a standalone Node/Express server for the bulk email delivery service. If you prefer to host your API completely separately from your Next.js application, you can configure and run this Express server.

---

## Features
- **Express-based Endpoint**: Provides `POST /api/send-bulk-email` for processing bulk delivery queues.
- **Background Mail Queue**: Instantly returns a `202 Accepted` response and processes email deliveries in the background asynchronously.
- **Throttling Delay**: Incorporates a 1-second delay between individual email deliveries to maintain an excellent sender IP reputation.
- **CORS Support**: Pre-configured with Cross-Origin Resource Sharing (`cors`) to support web app integration out of the box.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in this directory:
```bash
cp .env.example .env
```
Open `.env` and configure your SMTP credentials:
```env
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```
> [!NOTE]
> If using Gmail, make sure you configure an **App Password** from your Google account security settings instead of your raw password.

### 3. Run the Server
- **For Development (hot-reload enabled)**:
  ```bash
  npm run dev
  ```
- **For Production**:
  ```bash
  npm start
  ```

---

## API Documentation

### Send Bulk Email
- **Endpoint**: `POST /api/send-bulk-email`
- **Headers**: `Content-Type: application/json`
- **Body Structure**:
```json
{
  "emails": [
    "recipient1@example.com",
    "recipient2@example.com"
  ],
  "subject": "Exciting Announcement!",
  "htmlContent": "<h1>Hello there!</h1><p>Check out our latest update.</p>"
}
```

- **Successful Response (202 Accepted)**:
```json
{
  "message": "Broadcast started for 2 recipients. Processing queue in background..."
}
```
