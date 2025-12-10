import express from "express";
import notFoundHandler from "./middeware/notFoundHandler";
import errorHandling from "./middeware/ErrorHandling";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./database";

const app = express();

dotenv.config();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/media", express.static(path.join(__dirname, "../uploads")));

//routers ...

app.use(notFoundHandler);
app.use(errorHandling);

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB();
});
