const redis = require ('redis');
const client = redis.createClient(process.env.REDIS_URL);


const setJWT = (key,value) => {
    return new Promise((resolve,reject) => {
        try {
            client.set(key,value, (err,resp) => {
            if (err) reject(err);
            resolve(resp);
        });    
        } catch (error) {
           reject(error) 
        }
        
    })
    
}


const getJWT = (key) => {
    return new Promise((resolve,reject) => {
        try {
            client.get(key, (err,resp) => {
            if (err) reject(err);
            resolve(resp);
        });    
        } catch (error) {
           reject(error) 
        }
        
    })
    
}


module.exports = {
    setJWT,
    getJWT
}