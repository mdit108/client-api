const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");

const userAuthorization = async (req,res,next) => {
    const { authorization } = req.headers;
    const decoded =await verifyAccessJWT(authorization);
    if (decoded.email){
        const userID= await getJWT(authorization);
        if (!userID){
            return res.status(403).json({message: 'Forbidden'});
        }
        req.userID = userID;
        return next();
    }
    deleteJWT(authorization);
    res.status(403).json({message: 'Forbidden'});
    next();
}

module.exports = {
    userAuthorization,
};