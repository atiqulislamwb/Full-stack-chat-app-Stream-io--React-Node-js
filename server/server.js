import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import Twilio from "twilio";
const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

//Twilio account information
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = Twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
//Twilio setup

app.post("/", (req, res) => {
  const { message, user: sender, type, members } = req.body;

  if (type === "message.new") {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new message from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messagingServiceSid,
              to: user.phoneNumber,
            })
            .then(() => console.log("Message sent!"))
            .catch((err) => console.log(err));
        }
      });

    res.status(200).send({ msg: "Message Sent" });
  }

  res.status(201).send({ msg: "Not a new msg req" });
});

//Other route
app.use("/auth", authRoute);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
