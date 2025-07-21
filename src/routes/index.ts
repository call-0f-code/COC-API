import { Router } from "express";
import { Multer } from "multer";
import { SupabaseClient } from "@supabase/supabase-js";

import projectsRouter from "./projects";
import topicRouter from "./topics";
import quetionsRouter from "./questions";
import progressRouter from "./progress";

export default function routes(upload: Multer, supabase: SupabaseClient) {
  const router = Router();
  
  router.use("/projects", projectsRouter(upload, supabase));

  router.use("/topics", topicRouter());

  router.use("/questions", quetionsRouter());

  router.use("/progress", progressRouter());

  return router;
}

