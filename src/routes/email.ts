import express from "express";
import * as emailTemplateCtrl from "../controllers/emailTemplate.controller";

export default function emailRouter() {
  const router = express.Router();

  /**
   * @api {get} /email/templates List all email templates
   * @apiName ListEmailTemplates
   * @apiGroup EmailTemplate
   *
   * @apiSuccess {Object[]} templates Array of email templates.
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/api/v1/email/templates
   */
  router.get("/templates", emailTemplateCtrl.listTemplates);

  /**
   * @api {get} /email/templates/:id Get a single email template
   * @apiName GetEmailTemplate
   * @apiGroup EmailTemplate
   *
   * @apiParam (URL Params) {Number} id Template ID.
   *
   * @apiSuccess {Object} template Email template object.
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/api/v1/email/templates/1
   */
  router.get("/templates/:id", emailTemplateCtrl.getTemplate);

  /**
   * @api {post} /email/templates Save a new email template
   * @apiName CreateEmailTemplate
   * @apiGroup EmailTemplate
   *
   * @apiBody {String} name     Unique template name (e.g. "welcome"). (Required)
   * @apiBody {String} subject  Email subject line. (Required)
   * @apiBody {String} htmlBody HTML email body. Supports {{name}}, {{email}},
   *                            {{whatsapp_link}}, {{discord_link}}, {{year}}
   *                            placeholders. (Required)
   * @apiBody {String} [textBody] Plain-text fallback body.
   *
   * @apiSuccess {Object} template Saved template object.
   * @apiError (400) BadRequest Missing required fields.
   *
   * @apiExample {curl} Example usage:
   *   curl -X POST http://localhost:3000/api/v1/email/templates \
   *   -H "Content-Type: application/json" \
   *   -d '{
   *     "name": "welcome",
   *     "subject": "Welcome to Call of Code!",
   *     "htmlBody": "<h1>Hi {{name}}</h1><p>Join WhatsApp: {{whatsapp_link}}</p>"
   *   }'
   */
  router.post("/templates", emailTemplateCtrl.createTemplate);

  /**
   * @api {patch} /email/templates/:id Update an email template
   * @apiName UpdateEmailTemplate
   * @apiGroup EmailTemplate
   *
   * @apiParam (URL Params) {Number} id Template ID.
   * @apiBody {String} [name]     New unique name.
   * @apiBody {String} [subject]  New subject.
   * @apiBody {String} [htmlBody] New HTML body.
   * @apiBody {String} [textBody] New plain-text body.
   *
   * @apiSuccess {Object} template Updated template object.
   *
   * @apiExample {curl} Example usage:
   *   curl -X PATCH http://localhost:3000/api/v1/email/templates/1 \
   *   -H "Content-Type: application/json" \
   *   -d '{"subject": "Welcome aboard!"}'
   */
  router.patch("/templates/:id", emailTemplateCtrl.updateTemplate);

  /**
   * @api {delete} /email/templates/:id Delete an email template
   * @apiName DeleteEmailTemplate
   * @apiGroup EmailTemplate
   *
   * @apiParam (URL Params) {Number} id Template ID.
   *
   * @apiSuccess {String} message Confirmation message.
   *
   * @apiExample {curl} Example usage:
   *   curl -X DELETE http://localhost:3000/api/v1/email/templates/1
   */
  router.delete("/templates/:id", emailTemplateCtrl.deleteTemplate);

  return router;
}
