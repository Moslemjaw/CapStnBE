import { Router } from "express";
import {
  createResponse,
  getResponseById,
  updateResponse,
  deleteResponse,
  getResponsesBySurveyId,
  getResponsesByUserId,
  getResponses,
} from "./response.controller";

const responseRouter = Router();

responseRouter.get("/", getResponses);
responseRouter.get("/survey/:surveyId", getResponsesBySurveyId);
responseRouter.get("/user/:userId", getResponsesByUserId);
responseRouter.get("/:id", getResponseById);
responseRouter.post("/", createResponse);
responseRouter.put("/:id", updateResponse);
responseRouter.delete("/:id", deleteResponse);

export default responseRouter;
