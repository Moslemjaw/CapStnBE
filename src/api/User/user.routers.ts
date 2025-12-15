import { Router } from "express";
import { getAllUser, getUserById, login, register } from "./user.controllers";
import upload from "../../middeware/Multer";
const userRouter = Router();

userRouter.post("/register", upload.single("image"), register);
userRouter.post("/login", login);
userRouter.get("/", getAllUser);
userRouter.get("/:userId", getUserById);

export default userRouter;
