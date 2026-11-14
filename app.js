
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/index");

const app = express();

app.use(express.json());

app.use("/api/v1/", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ok Running",
  });
});

// Export Express app
module.exports = app;


// npm install swagger-ui-express swagger-jsdoc
// 2. اعمل ملف config/swagger.js


// const swaggerJsdoc = require("swagger-jsdoc");
// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "My Backend API",
//       version: "1.0.0",
//       description: "API Documentation",
//     },
//     servers: [
//       {
//         url: "https://your-project.vercel.app",
//         description: "Production Server",
//       },
//       {
//         url: "http://localhost:5000",
//         description: "Local Server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//   },
//   apis: ["./routes/*.js"],
// };

// module.exports = swaggerJsdoc(options);



// 3. أضف Swagger في app.js

// javascript
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./config/swagger");

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 4. اكتب Documentation فوق كل Route
// مثلًا في routes/trips.js:


// javascript
/**
 * @swagger
 * /api/v1/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trips retrieved successfully
 *       401:
 *         description: Unauthorized
 */
// router.get("/trips", protect, getTrips);