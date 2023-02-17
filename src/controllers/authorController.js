const authorModel = require("../models/authorModel");

const createAuthor = async function(req, res){
  try{
    let details = req.body 

    const letters = /^[A-Za-z]+$/;
    //console.log(details)

    if(!details.fname) return res.status(400).send({status: false, msg: "first name is required"} );
    if(!details.fname.match(letters)){return res.status(400).send({status: false, msg: 'First name should contain only alphabets'})};
    
    if(!details.lname) return res.status(400).send({status: false, msg: "Last name is required"} );
    if(!details.lname.match(letters)){return res.status(400).send({status: false, msg: 'Last name should contain only alphabets'})};

    if(!details.title) return res.status(400).send({status: false, msg: "Title is required"} );
    let word = ['Mr', 'Mrs', 'Miss'];
    if(!word.includes(details.title)){return res.status(400).send({status: false, msg: 'Title can accept only Mr/Mrs/Miss!'})};

    if(!details.email) return res.status(400).send({status: false, msg: "Email is required"} );
    let isUnique = await authorModel.findOne({email: details.email});
    if(isUnique){return res.status(400).send({status: false, msg: 'Enter a unique email id!'})};

    if(!details.password) return res.status(400).send({status: false, msg: "Password is required"} );
  
    const validateEmail = (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(details.email));
    if(!validateEmail) return res.status(400).send({status: false, msg: "Invalid Email ID, Please check"});
  
    const data = await authorModel.create(details)  
    res.status(201).send({status: true, data: data});     
  }
  catch(err){
    res.status(500).send({status: false, error: err.message});
  }
}

module.exports = {createAuthor};