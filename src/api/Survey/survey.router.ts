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
import { authorize } from "../../middeware/Authorize";

const surveyRouter = Router();

surveyRouter.get("/published", getPublishedSurveys);
surveyRouter.get("/unpublished", getUnpublishedSurveys);
surveyRouter.get("/:id", getSurveyById);
// :ater check if the user is the creator of the survey for delete and update
surveyRouter.put("/publish/:id", authorize, publishSurvey);
surveyRouter.put("/unpublish/:id", authorize, unpublishSurvey);
surveyRouter.put("/:id", updateSurvey);
surveyRouter.delete("/:id", deleteSurvey);
// Protected routes – require a valid JWT so we can set req.user.id as creatorId
surveyRouter.post("/", authorize, createSurvey);

export default surveyRouter;
