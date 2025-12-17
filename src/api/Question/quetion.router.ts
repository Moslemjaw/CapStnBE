import { Router } from "express";
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsBySurveyId,
  getQuestions,
} from "./question.controller";
const questionRouter = Router();

questionRouter.get("/", getQuestions);
questionRouter.get("/survey/:surveyId", getQuestionsBySurveyId);
questionRouter.get("/:id", getQuestionById);
questionRouter.post("/", createQuestion);
questionRouter.put("/:id", updateQuestion);
questionRouter.delete("/:id", deleteQuestion);

export default questionRouter;
