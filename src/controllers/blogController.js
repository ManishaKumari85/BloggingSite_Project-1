const blogModel = require("../models/blogModel");
const authorModel = require ("../models/authorModel");
const authorController = require("../models/authorModel");
const blogController = require("../models/blogModel");
const validator = require("validator");

const createBlog = async function(req, res){
    try{
        const details = req.body;  
        let {title, body, authorId, category} = details; 

        if(!title) return res.status(400).send({status: false, msg: "Title of the blog is required"});
        if(!validator.isLength(title, {min: 5, max: 30})){return res.status(400).send({status: false, msg: 'The length of the title should contain minium 5 and maximum 30 charactors!'})};
        
        if(!body) return res.status(400).send({status: false, msg: "Body of the blog is required"});
        if(!validator.isLength(body, {min: 10})){return res.status(400).send({status: false, msg: 'The length of body should have atleast 10 letters.'})};
        
        if(!authorId) return res.status(400).send({status: false, msg: "Author_Id of the blog is required"});
        let authorDetails = await authorModel.findOne({_id: authorId});
        if(!authorDetails){res.status(400).send({status: false, msg: "The Author with the given author id doesn't exist"})};
        
        if(!category) return res.status(400).send({status: false, msg: "Category of the blog is required"});

        const validate = await authorController.findById(details.authorId);
        if(!validate) return res.status(400).send({status: false, msg: "You have entered a invalid Author_Id"});

        const data = await blogController.create(details) 
        res.status(200).send({status: true, data: data}) 
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

const getBlog = async function(req, res){   
    try{
        let q = req.query; 
        let filter = {
            isDeleted: false,
            isPublished: true,
            ...q
        };
        if(q.authorId){
            const validate = await authorController.findById(q.authorId);
            if(!validate) return res.status(404).send({status:false, msg: "AuthorId is not valid"});
        }

        const data = await blogModel.find(filter);
        //console.log(filter)
        if(data.length == 0) return res.status(404).send({status:false, msg: "no blog is found"});

        res.status(201).send({status: true, data: data})
    }catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

const updateBlog = async function(req, res){
    try{
        const blogId = req.params.blogId
        const details = req.body
        const authorFromToken = req.authorId
        if(!authorFromToken) return res.status(400).send({status: false, message: "It is not a valid token"})
        const validId = await blogModel.findById(blogId)
        if (!validId) return res.status(400).send({status:false, msg:"Blog Id is invalid"});

        if(validId.authorId.toString() !== authorFromToken){
            return res.status(400).send({status: false, message:"Your are not authorised"})
        }

        if(validId.isDeleted == true) return res.status(404).send({status: false, msg: "The blog is already deleted"});
       
        const updatedDetails = await blogModel.findOneAndUpdate(
            {_id : blogId},
            {$push: {tags : details.tags, subcategory : details.subcategory},
            $set: {title : details.title, body : details.body, isPublished : true, publishedAt : new Date()}},
            {new : true, upsert : true}
        );
        res.status(200).send({status:true, message: "Your blog is updated", data:updatedDetails})
    }
    catch(err) {
        console.log(err)
        res.status(500).send({status:false, msg: err.message})
    }
}

const deleteBlogById = async function(req, res){
    try{
        const blogId = req.params.blogId;
        const authorFromToken = req.authorId
        if(!authorFromToken) return res.status(400).send({status: false, message: "It is not a valid token"})
        if(!blogId) return res.status(404).send({status: false, msg: "BlogId is invalid"});

        const check = await blogModel.findById({_id: blogId}); 

        if(check.authorId.toString() !== authorFromToken){
            return res.status(400).send({status: false, message:"Your are not authorised"})
        }

        if(check.isDeleted == true) return res.status(404).send({status: false, msg: "The blog is already deleted"});

        const deleteDetails = await blogModel.findOneAndUpdate(
            {_id: blogId },
            {isDeleted: true, deletedAt: new Date()},
            {new: true}
        );
        res.status(200).send({status: true, data:"blog deleted sucessfully"});
    }catch(err){
        res.status(404).send({msg: err.message});
    }
}

const deleteBlogByQuery = async function(req, res){
    try{
        let data = req.query;
        let authorFromToken = req.authorId
        let valid = await authorModel.findById(authorFromToken)
        if (valid._id.toString() !== authorFromToken) return res.status(401).send({ status: false, message: "Unauthorized access ! user doesn't match" })
        const deleteByQuery = await blogModel.updateMany(
            {$and: [data, { authorId: valid, isDeleted: false }] },
            {$set: { isDeleted: true, DeletedAt: new Date() } },
            {new: true }
        )
        if (deleteByQuery.modifiedCount == 0) return res.status(400).send({ status: false, msg: "The Blog is already Deleted" })
        res.status(200).send({ status: true, msg: deleteByQuery })
    }catch(err){
        res.status(500).send({status: false, msg: err.message})
    }
}

module.exports = {createBlog, getBlog, updateBlog, deleteBlogById, deleteBlogByQuery};