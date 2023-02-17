const JWT = require("jsonwebtoken");
const authorModel = require("../models/authorModel");

;const logInUser = async function (req, res) {
    try {
        let userName = req.body.email
        let password = req.body.password
        if (!userName) return res.status(400).send({ status: false, msg: "user Name is required" });
        if (!password) return res.status(400).send({ status: false, msg: "password is required" });
        const check = await authorModel.findOne({email: userName,password: password});
        if (!check) return res.status(400).send({ status: false, msg: "userName or password is wrong" })
        let token = JWT.sign(
             {
             userId: check._id.toString()
             },
            "project-blog"
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, data: token});
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

module.exports={logInUser}