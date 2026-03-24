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
 * /apps/system/public:
 *   get:
 *     summary: Get system app public credentials
 *     tags: [Internal App APIs]
 *     responses:
 *       200:
 *         description: System app details
 */

/**
 * @swagger
 * /apps/user/warnings:
 *   get:
 *     summary: Get user warnings
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user warnings
 */

/**
 * @swagger
 * /apps/{app_id}:
 *   get:
 *     summary: Get app by ID
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
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
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
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
 *               is_active:
 *                 type: boolean
 *               retention_days:
 *                 type: integer
 *                 nullable: true
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
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: App deleted successfully
 */

/**
 * @swagger
 * /apps/{app_id}/rotate-secret:
 *   post:
 *     summary: Rotate app secret key
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secret rotated successfully
 */

/**
 * @swagger
 * /apps/{app_id}/notifications:
 *   get:
 *     summary: Get app notification history
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications
 */

/**
 * @swagger
 * /apps/{app_id}/notifications/{notification_id}/logs:
 *   get:
 *     summary: Get notification delivery logs
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of delivery logs
 */

/**
 * @swagger
 * /apps/{app_id}/subscribers:
 *   get:
 *     summary: Get app subscribers
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscribers
 */

/**
 * @swagger
 * /apps/{app_id}/push:
 *   post:
 *     summary: Send push notification from admin panel
 *     tags: [Internal App APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification
 *             properties:
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   icon:
 *                     type: string
 *               targets:
 *                 type: object
 *                 properties:
 *                   externalUserIds:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
