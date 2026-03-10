// This file contains Swagger annotations that will be prepended to apps.routes.ts

/**
 * @swagger
 * tags:
 *   name: Internal App APIs
 *   description: Internal endpoints for application management
 */

/**
 * @swagger
 * /apps:
 *   get:
 *     summary: Get user's apps
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's apps
 *   post:
 *     summary: Create a new app
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: App created successfully
 */

/**
 * @swagger
 * /apps/{id}:
 *   get:
 *     summary: Get app by ID
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: App details
 *   patch:
 *     summary: Update app
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: App updated successfully
 *   delete:
 *     summary: Delete app
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: App deleted successfully
 */

/**
 * @swagger
 * /apps/{id}/rotate-secret:
 *   post:
 *     summary: Rotate app secret key
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Secret rotated successfully
 */
