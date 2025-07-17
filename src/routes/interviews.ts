import express from 'express';
import * as interviewCtrl from '../controllers/interview.controller';
import { supabase } from '../app';
import { Multer } from 'multer';
import { NextFunction } from 'express-serve-static-core';
import { SupabaseClient } from '@supabase/supabase-js';



export default function interviewRouter(upload: Multer, supabase: SupabaseClient) {
    const router = express.Router();


    router.get('/', interviewCtrl.getInterviews);
    router.get('/:id', interviewCtrl.getInterviewById);
    router.post('/:memberId', interviewCtrl.createInterview);
    router.patch('/:id',interviewCtrl.updateInterviewById);
    router.delete('/:id',interviewCtrl.deleteInterviewById);


    // router.get('/:acheivementId',interviewCtrl.getAchievementById);
    // router.patch('/:acheivementId',interviewCtrl.updateAchievementById);
    // router.delete('/:acheivementId',interviewCtrl.deleteAchievementById);



    return router
}