const { Router } = require("express");
const lessonsRouter = require("./lessonsRouter.js");
const router = new Router();

/**
 * @openapi
 * tags:
 *   - name: 'Lessons'
 *     description: Lessons
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     ApiError:
 *       type: object
 *       properties:
 *         response: 
 *           type: string
 *           description: Custom api error text
 */
router.use('/', lessonsRouter);

module.exports = router;