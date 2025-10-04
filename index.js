import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { WebClient } from "@slack/web-api";
import slackRoutes from "./src/Routes/slackRoutes.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

// Initialize Slack client with bot token
export const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

app.use("/api/slack", slackRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Slack API Backend Running!',
    status: 'OK' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});