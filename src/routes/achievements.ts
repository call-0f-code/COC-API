import express from 'express';
import * as acheivementsCtrl from '../controllers/achievement.controller';
import { Multer } from 'multer';
import { SupabaseClient } from '@supabase/supabase-js';

import { Request, Response,NextFunction } from 'express';

export function parseCreateAchievementData(req: Request, res: Response, next: NextFunction) {
  if (req.body.achievementData) {
    try {
      req.body.achievementData = JSON.parse(req.body.achievementData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid JSON in achievementData field' });
    }
  }
  next();
}



export default function acheivementsRouter(upload: Multer, supabase: SupabaseClient) {
    const router = express.Router();


    /**
   * @api {get} /achievements Get all achievements
   * @apiName getAchievements
   * @apiGroup Achievement
   *
   * @apiSuccess {Object[]} achievements List of achievements
   * @apiError (500) InternalServerError Failed to fetch achievements
   */
    router.get('/',  acheivementsCtrl.getAchievements);



   /**
   * @api {get} /achievements/:achievementId Get achievement by ID
   * @apiName getAchievementById
   * @apiGroup Achievement
   *
   * @apiParam (Path Params) {Number} achievementId Achievement ID
   * @apiSuccess {Object} achievement Achievement object
   * @apiError (400) BadRequest Invalid ID
   * @apiError (404) NotFound Achievement not found
   */
    router.get("/:achievementId", acheivementsCtrl.getAchievementById);


  /**
   * @api {post} /achievements Create a new achievement
   * @apiName createAchievement
   * @apiGroup Achievement
   *
   * @apiBody (FormData) {File} image Image file
   * @apiBody (FormData) {String} achievementData JSON string of achievement fields:
   *   - title: string
   *   - description: string
   *   - achievedAt: Date
   *   - createdById: string
   *   - members: string[] 
   *
   * @apiSuccess {Object} achievement Created achievement
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (500) InternalServerError Server error
   */
    router.post("/",  upload.single('image') , parseCreateAchievementData ,acheivementsCtrl.createAchievement);


/**
   * @api {patch} /achievements/:achievementId Update an achievement
   * @apiName updateAchievement
   * @apiGroup Achievement
   *
   * @apiParam (Path Params) {Number} achievementId Achievement ID
   * @apiBody (FormData) {File} [image] Optional new image
   * @apiBody (FormData) {String} achievementData JSON string of updated fields:
   *   - title?: string
   *   - description?: string
   *   - achievedAt?: Date
   *   - updatedById: string
   *   - members?: string[]
   *
   * @apiSuccess {Object} achievement Updated achievement
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Not allowed to update
   * @apiError (404) NotFound Achievement not found
   * @apiError (500) InternalServerError Server error
   */
    router.patch("/:achievementId",upload.single('image') , parseCreateAchievementData , acheivementsCtrl.updateAchievementById);


    /**
   * @api {delete} /achievements/:achievementId Delete an achievement
   * @apiName deleteAchievement
   * @apiGroup Achievement
   *
   * @apiParam (Path Params) {Number} achievementId Achievement ID
   *
   * @apiSuccess {String} message Deletion confirmation
   * @apiError (400) BadRequest Invalid ID
   * @apiError (404) NotFound Achievement not found
   * @apiError (500) InternalServerError Server error
   */
    router.delete("/:achievementId", acheivementsCtrl.deleteAchievementById);

  /**
   * @api {delete} /achievements/:achievementId/members/:memberId Remove a member from achievement
   * @apiName removeMemberFromAchievement
   * @apiGroup Achievement
   *
   * @apiParam (Path Params) {Number} achievementId Achievement ID
   * @apiParam (Path Params) {UUID} memberId Member ID
   *
   * @apiSuccess {String} message Success message
   * @apiError (400) BadRequest Missing or invalid parameters
   * @apiError (500) InternalServerError Server error
   */
    router.delete("/:achievementId/members/:memberId", acheivementsCtrl.removeMemberFromAchievement);

    return router
}