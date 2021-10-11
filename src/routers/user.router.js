const express = require ('express');
const {route} = require("./ticket.router")
const router = express.Router();

const {insertUser} = require("../models/user/User.model")
const {hashPassword} = require ("../helpers/bcrypt.helper")
router.all('/',(req,res,next)=> {
    // res.json({message: 'Return from user router'})
    next()
})

router.post('/',async (req,res)=> {
    const {name,company,address,phone,email,password} = req.body;

    try{
        //hash password
        const hashedPass = await hashPassword(password)
        const newUserObject = {
            name,company,address,phone,email,password: hashedPass,
        }
        const result = await insertUser(newUserObject);    
        console.log(result)
        res.json({message:"New User Created",result})
    }

    catch(error){
        console.log(error)
        res.json({status:'error',message:error.message})
    }
})

module.exports = router;