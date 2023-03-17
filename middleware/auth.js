const {User} = require('../models/User');
let auth = (req, res, next) => {
    //인증 처리 하는 곳
    
    
    //클라이언트 쿠키에서 토큰을 가져오고
    let token = req.cookies.x_auth;
    
    //토큰을 복호화 한후 유저를 찾는다
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({isAuth: false, error: true})

        req.token = token;
        req.user = user;
        next(); //index.js에서 auth는 middleware이다. 할 거 다했으면 진행이 될 수 있도록
    })
    
    //유저가 있으면 인증
    
    
    //유저가 없으면 인증x 




}

module.exports = { auth };