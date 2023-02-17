const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const blogModel = require("../models/blogModel")
var decodedToken

let authentication = async function(req, res, next){
    try{
        let token = req.headers[`x-api-key`]
        if(!token) return res.status(400).send({status: false, msg: "Token must be present in Headers"});
       decodedToken = jwt.verify(token, "project-blog");
        if(!decodedToken) return  res.status(400).send({ status: false, msg: "Please enter a valid Token"});
        req.authorId = decodedToken.userId
        next();
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message})
    }
}

const authorization = async function (req, res, next) {
    try {
      let presentPrams = req.params
      if (Object.keys(presentPrams).length == 0) presentPrams = req.query
      if (Object.keys(presentPrams).length == 0) return res.status(400).send({ status: false, msg: "no input found" })
  
      if (presentPrams.blogId)
        if (!mongoose.isValidObjectId(presentPrams.blogId))
          return res.status(400).send({ status: false, msg: "invalid blogId" })
  
      if (presentPrams.authorId)
        if (!mongoose.isValidObjectId(presentPrams.authorId))
          return res.status(400).send({ status: false, msg: "invalid authorId" })
  
      let auth
      if (!presentPrams.blogId) {
        auth = await blogModel.find({$and:[{authorId:decodedToken.authorId},presentPrams]}).select({ _id: 0, authorId: 1 })
        if(auth.keys()==-1)
        return res.status(404).send({status:false,msg:"unautorised"})
      } else {
        auth = await blogModel.findById({_id: presentPrams.blogId }).select({_id: 0, authorId: 1 })
        if (!auth) return res.status(404).send({ status: false, msg: "NoT found" })
        console.log(decodedToken.userId)

        if(decodedToken.userId!=auth.authorId)
        return res.status(404).send({status:false,msg:"unautorised"})
      }
      next()
    } catch (err) {
      res.status(500).send({ status:false, msg: err.message })
  
    }
  }



module.exports = {authentication , authorization};