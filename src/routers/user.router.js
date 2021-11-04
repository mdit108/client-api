const express = require ('express');
const {route} = require("./ticket.router")
const router = express.Router();

const {insertUser,getUserByEmail,getUserByID, updatePassword} = require("../models/user/User.model")
const {hashPassword,comparePassword} = require ("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require('../helpers/jwt.helper');
const {userAuthorization} = require ("../middleware/authorization.middleware");
const { setPasswordResetPin, getPinByEmailPin, deletePin } = require('../models/reset-pin/Reset-pin.model');
const { emailProcessor } = require('../helpers/email.helper');
router.all('/',(req,res,next)=> {
    // res.json({message: 'Return from user router'})
    next()
})

//Get user profile router
router.get('/',userAuthorization, async(req,res) => {
    const _id = req.userID

    const userProf = await getUserByID(_id)
    res.json({user: userProf})
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

router.post('/reset-password', async(req,res) => {
    const {email} = req.body;
    const user = await getUserByEmail(email);
    if (user && user._id){
        const setPin = await setPasswordResetPin(email);
        const result = await emailProcessor({email,pin:setPin.pin,type:'pass-update-req'})
        if (result && result.messageId){
            return res.json({
                status:'success',
                message: 'Check your email for Reset Pin'
            })
        }
        return res.json({
            status:'success',
            message: 'Technical error! Try again later.'
        })
    }
    res.json({status:'error', message: 'User does not exist'});
})

router.patch('/reset-password',async(req,res)=> {
    const {email,pin,newPassword} = req.body;
    const getPin = await getPinByEmailPin(email,pin);
    if (!getPin){
        return res.json({status:'error',message:'Invalid or expired pin'})
    }
    if (getPin._id){
        const dbDate = getPin.addedAt;
        const expiresIn = 1;
        let expDate = dbDate.setDate(dbDate.getDate()+expiresIn);
        const today = new Date();
        if (today > expDate){
            return res.json({status:'error',message:'Invalid or expired pin'})
        }
        const hashedPass = await hashPassword(newPassword);
        const user = await updatePassword(email,hashedPass)
        if (user._id){
            await emailProcessor({email,type:'pass-update-success'})
            deletePin(email,pin);
            return res.json({status:'success',message:'Your password has been updated'})
        }

    }
    return res.json({status:'error',message: 'Unable to update Password. Please try again'});
})

module.exports = router;