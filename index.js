const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

var fs = require('fs');
var url = require('url');
var helmet = require('helmet');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const {User} = require("./models/User");
const {auth} = require("./middleware/auth");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application.jsongit 
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'views')));

// var passport = require('passport')
// , LocalStrategy = require('passport-local')
// .Strategy;

const config = require('./config/key')
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


//나중에 홈페이지에 방명록 구현할 때 사용할 함수
// function templateList(filelist){
//     var list = `<ul>`;
//     var i =0;
//     while(i<filelist.length){
//         list = list + `<li><a href="/?name=${filelist[i]}">${filelist[i]}</a></li>`;
//         i += 1;
//     }
//     list = list + `</ul>`;
//     return list;
// }

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/homepage', (req, res) => {
    // var _url = request.url;
    // var queryData = url.parse(_url, true).query;
    // var pathname = url.parse(_url, true).pathname;
    // console.log(pathname);
    // if(queryData.name === undefined){
    // }
    res.render('homepage');


    //나중에 홈페이지에 방명록 구현할 때 사용할 함수
    // if(pathname ==='/homepage'){
    //     if(queryData.name === undefined){
    //         fs.readdir('./data', function(err, filelist){
    //             var title = 'Welcome';
    //             var description = 'Please login';
    //             var list = templateList(filelist);
    //             var template = templateHTML(title, list,
    //                 `<h2>${title}</h2>${description}
    //                 form(action='/homepage')
    //                     <p>
    //                         button(type="button" onclick="location.href='http://localhost:3000/login'") 로그인 페이지로 이동
    //                     </p>`
    //                 );
    //         })
    //     }
    // }
})
app.post('/signup_page', (req, res) => {
    //회원가입할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    // res.render('signup');


    const user = new User(req.body);

    // user.save((err, doc)=>{
    //     if(err) return res.json({
    //         success: false, err
    //     });
    //     return res.status(200).json({
    //         success: true
    //     });
    // });

    // data.save((err, result) => {
    //     if(!err) console.log(result);
    //  })

    // const result = await data.save() // Make sure to wrap this code in an async function
    // console.log(result);

    // const doc = await user.save()
    // console.log(doc);
    User.findOne({email: req.body.email}).then((user_email) => {
        if(user_email){
            return res.json({
                SignupSuccess: false, 
                message: "이미 존재하는 이메일입니다"
            })
        } else {
            user.save().then(()=>{
                // return res.status(200).json({
                //     success: true,
                //     message: "Signed success"
                //     });
                return res.status(200).redirect('/login');
                
            }).catch((err)=>{
                console.log(err);
            })
        }
    }) 
});


app.post('/login_page', (req, res) => {
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
            
            //비밀번호가 맞다면 토큰 생성
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


// app.post('/login', 
// passport.authenticate('local', {
//     successRdeirect: '/homepage', 
//     failureRedirect: '/login'
// }));

//role 0 일반유저       role 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 true
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
    })
})


app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {token: ""})
    .catch((err)=>{
        console.log(token);
        return res.json({success: false, err});
    })
    .then((user)=>{
        return res.cookie("x_auth", user.token).status(200).send({
            success: true
        })
    })
})



// module.exports = () => {
//     passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
//       done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
//     });
  
//     passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
//       done(null, user); // 여기의 user가 req.user가 됨
//     });
  
//     passport.use(new LocalStrategy({ // local 전략을 세움
//       usernameField: 'id',
//       passwordField: 'pw',
//       session: true, // 세션에 저장 여부
//       passReqToCallback: false,
//     }, (id, password, done) => {
//       Users.findOne({ id: id }, (findError, user) => {
//         if (findError) return done(findError); // 서버 에러 처리
//         if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
//         return user.comparePassword(password, (passError, isMatch) => {
//           if (isMatch) {
//             return done(null, user); // 검증 성공
//           }
//           return done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
//         });
//       });
//     }));
//   };

app.listen(port, () => console.log(`listening on port ${port}!`));



      