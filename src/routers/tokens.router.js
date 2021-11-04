const express = require ('express');
const { verifyRefreshJWT, createAccessJWT } = require('../helpers/jwt.helper');
const { getUserByEmail } = require('../models/user/User.model');
const router = express.Router();

router.all('/',async(req,res,next)=> {
    const {authorization} = req.headers;
    const decoded = await verifyRefreshJWT(authorization)
    
    if (decoded.payload){
        const userProf = await getUserByEmail(decoded.payload);
        if (userProf._id){

            let tokenExp= userProf.refreshJWT.addedAt;
            const dBrefreshToken = userProf.refreshJWT.token;
            tokenExp = tokenExp.setDate(tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY)
            const today = new Date();
            if (dBrefreshToken!==authorization && tokenExp<today){
                return res.status(403).json({message:"Forbidden"})
            }
            const accessJWT = await createAccessJWT(decoded.payload,userProf._id.toString())
            return res.json({status:"success",accessJWT})
        }
    }
    res.status(403).json({message: "Forbidden"})
})

module.exports = router;