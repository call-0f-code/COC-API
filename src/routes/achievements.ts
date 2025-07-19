import express from 'express';
import * as acheivementsCtrl from '../controllers/achievement.controller';
import { supabase } from '../app';
import { Multer } from 'multer';
import { NextFunction } from 'express-serve-static-core';
import { SupabaseClient } from '@supabase/supabase-js';



export default function acheivementsRouter(upload: Multer, supabase: SupabaseClient) {
    const router = express.Router();


    router.get('/', acheivementsCtrl.getAchievements);
    router.get("/:achievementId", acheivementsCtrl.getAchievementById);
    router.post("/", acheivementsCtrl.createAchievement);
    router.patch("/:achievementId", acheivementsCtrl.updateAchievementById);
    router.delete("/:achievementId", acheivementsCtrl.deleteAchievementById);
    // router.post("/:achievementId/members", acheivementsCtrl.addMemberToAchievement);  // add single member
    router.delete("/:achievementId/members", acheivementsCtrl.removeMemberFromAchievement);


    return router
}