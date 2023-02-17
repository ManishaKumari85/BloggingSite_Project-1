const express = require('express');
const router = express.Router();
const userController = require("../controllers/authorController");
const blogController = require("../controllers/blogController");
const logInController = require("../controllers/loginController");
const mw = require("../middleware/auth");

router.get("/test-me", function (req, res) {
    res.send("My first ever api!");
})

router.post("/authors", userController.createAuthor);
router.post("/login",logInController.logInUser);

router.post("/blogs", mw.authentication,blogController.createBlog);
router.get("/blogs",blogController.getBlog);
router.put("/blogs/:blogId", mw.authentication,mw.authorization,blogController.updateBlog);

router.delete("/blogs/:blogId",mw.authentication,mw.authorization, blogController.deleteBlogById);
router.delete("/blogs", mw.authentication,mw.authorization, blogController.deleteBlogByQuery);

module.exports = router;