const express = require('express');
var router = express.Router();



const {User} = require("../models/User");

// router.use(session({
//     secret: 'My secret!',
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//         maxAge : 60*60
//     },
//     store: new fileStore()
// }))


router.post('/users/login_page', (req, res) => {
    
    //요청한 이메일을 데이터베이스에 있는지 찾고
    // User.findOne({email: req.body.email}, (err, user)=>{
    //     if(!user){
    //         return res.json({
    //             loginSuccess: false, 
    //             message: "이메일 검색 실패"
    //         })
    //     }
    // })
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            // return res.json({
            //     loginSuccess: false, 
            //     message: "이메일 검색 실패"
            // })
            return res.status(200).redirect('/login');
        }
        //이메일 있으면 비밀번호 맞는지 확인하고
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."});    
            }
            // app.use(session({
            //     secret: 'My secret!',
            //     resave: false,
            //     saveUninitialized: true,
            //     cookie:{
            //         maxAge : 60*60
            //     },
            //     store: new fileStore()
            // }))
            // req.session._id = user.name;
            //console.log(req.session.name);

            // req.session.is_logined = true;
            // 비밀번호가 맞다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
    
                //토큰을 저장한다. 쿠키, 로컬스토리지 등에 저장할 수 있다.
                res.cookie("x_auth", user.token)
                .status(200)
                .redirect('/homepage')
            })
            
        
        })
    })
    .catch((err) => {
        console.log(err);
    })
    //비밀번호 맞으면 토큰 생성
    
/*
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });
    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            Passport.authenticate("local")(req, res, () => {
                res.redirect("/homepage")
            })
        }
    })
    */
})


/*
app.post('/api/users/login_page', (req, res) => {
    //요청한 이메일을 데이터베이스에 있는지 찾고
    // User.findOne({email: req.body.email}, (err, user)=>{
    //     if(!user){
    //         return res.json({
    //             loginSuccess: false, 
    //             message: "이메일 검색 실패"
    //         })
    //     }
    // })
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            // return res.json({
            //     loginSuccess: false, 
            //     message: "이메일 검색 실패"
            // })  

            return res.status(200).redirect('/login');
        }
        //이메일 있으면 비밀번호 맞는지 확인하고
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."});    
            }
            app.use(session({
                secret: 'My secret!',
                resave: false,
                saveUninitialized: true,
                cookie:{
                    maxAge : 60*60
                },
                store: new fileStore()
            }))
            req.session._id = user.name;
            //console.log(req.session.name);

            req.session.is_logined = true;
            // 비밀번호가 맞다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
    
                //토큰을 저장한다. 쿠키, 로컬스토리지 등에 저장할 수 있다.
                res.cookie("x_auth", user.token)
                .status(200)
                .redirect('/homepage')
            })
            
        
        })
    })
    .catch((err) => {
        console.log(err);
    })
    //비밀번호 맞으면 토큰 생성
})
*/

module.exports = router;