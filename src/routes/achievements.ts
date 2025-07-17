import express from 'express';
import * as acheivementsCtrl from '../controllers/achievement.controller';
import { supabase } from '../app';
import { Multer } from 'multer';
import { NextFunction } from 'express-serve-static-core';
import { SupabaseClient } from '@supabase/supabase-js';



export default function acheivementsRouter(upload: Multer, supabase: SupabaseClient) {
    const router = express.Router();


    router.get('/', acheivementsCtrl.getAchievements);
    router.get('/:acheivementId',acheivementsCtrl.getAchievementById);
    router.patch('/:acheivementId',acheivementsCtrl.updateAchievementById);
    router.delete('/:acheivementId',acheivementsCtrl.deleteAchievementById);



    return router
}