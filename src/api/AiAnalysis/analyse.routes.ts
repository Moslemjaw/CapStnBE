import { Router } from "express";
import {
  testAI,
  createAnalysis,
  getAnalysisStatus,
  getAllAnalyses,
} from "./analyse.controller";
import { authorize } from "../../middeware/Authorize";

const aiRouter = Router();

aiRouter.post("/test", testAI);
aiRouter.post("/", authorize, createAnalysis);
aiRouter.get("/", authorize, getAllAnalyses);
aiRouter.get("/:analysisId", authorize, getAnalysisStatus);

export default aiRouter;
