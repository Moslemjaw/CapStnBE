import express from "express";
import notFoundHandler from "./middeware/notFoundHandler";
import errorHandling from "./middeware/ErrorHandling";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./database";
import userRouter from "./api/User/user.routers";
import aiRouter from "./api/AiAnalysis/analyse.routes";
import surveyRouter from "./api/Survey/survey.router";
import questionRouter from "./api/Question/quetion.router";
import responseRouter from "./api/Response/response.router";

const app = express();

dotenv.config();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/media", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint for Digital Ocean
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

//routers ...

app.use("/analyse", aiRouter);
app.use("/user", userRouter);
app.use("/survey", surveyRouter);
app.use("/question", questionRouter);
app.use("/response", responseRouter);

app.use(notFoundHandler);
app.use(errorHandling);

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
