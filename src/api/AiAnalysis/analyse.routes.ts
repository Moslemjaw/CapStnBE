import { Router } from "express";
import {
  testAI,
  createAnalysis,
  getAnalysisStatus,
} from "./analyse.controller";
import { authorize } from "../../middeware/Authorize";

const aiRouter = Router();

aiRouter.post("/test", testAI);
aiRouter.post("/analyze", authorize, createAnalysis);
aiRouter.get("/analyze/:analysisId", authorize, getAnalysisStatus);

export default aiRouter;
