// External Module
const express = require("express");
const userRouter = express.Router();

// Local Module
const userController = require("../controllers/userController");



userRouter.get("/", userController.getIndex);
userRouter.get("/materials", userController.getMaterial);
userRouter.get("/about", userController.getAbout);
userRouter.get("/contactus", userController.getContactus);


module.exports = userRouter;