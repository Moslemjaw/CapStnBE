import { Router } from "express";
import {
  createSurvey,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  unpublishSurvey,
  getPublishedSurveys,
  getUnpublishedSurveys,
  getSurveys,
  getSurveysByCreatorId,
  getSurveyByTitle,
} from "./survey.controller";

const surveyRouter = Router();

surveyRouter.get("/published", getPublishedSurveys);
surveyRouter.get("/unpublished", getUnpublishedSurveys);
surveyRouter.get("/:id", getSurveyById);
surveyRouter.put("/:id", updateSurvey);
surveyRouter.delete("/:id", deleteSurvey);
surveyRouter.post("/", createSurvey);
surveyRouter.post("/publish/:id", publishSurvey);
surveyRouter.post("/unpublish/:id", unpublishSurvey);

export default surveyRouter;
