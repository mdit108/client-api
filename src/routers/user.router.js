const express = require ('express');
const {route} = require("./ticket.router")
const router = express.Router();

const {insertUser,getUserByEmail} = require("../models/user/User.model")
const {hashPassword,comparePassword} = require ("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require('../helpers/jwt.helper');
router.all('/',(req,res,next)=> {
    // res.json({message: 'Return from user router'})
    next()
})


//Create New User Route
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

//User Sign in router
router.post('/login',async(req,res)=> {
    const {email,password} = req.body;
    //get user with email from db
    //hash our password and compare with db
    if (!email || !password){
        return res.json({status:'error',message: 'Invalid form submission'})
    }

    const user = await getUserByEmail(email);
    const passFromDb = user && user._id ? user.password : null;
    if (!passFromDb){
        return res.json({status:'error',message: 'Invalid email or password'})
    }
    const result = await comparePassword (password,passFromDb);
    if (!result){
        return res.json({status:'error',message: 'Invalid email or password'})
    }
    const accessJWT = await createAccessJWT(user.email,`${user._id}`);
    const refreshJWT = await createRefreshJWT(user.email,`${user._id}`);
    console.log(result);

    res.json({status:'success',message: 'successfully logged in',accessJWT,refreshJWT})
})

module.exports = router;