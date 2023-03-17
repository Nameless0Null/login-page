const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const {User} = require("./models/User");
const {auth} = require("./middleware/auth");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application.json
app.use(bodyParser.json());

app.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'views')));

const config = require('./config/key')
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/signup', (req, res) => {
    //회원가입할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
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
    
    user.save().then(()=>{
        return res.status(200).json({
            success: true,
            message: "Signed success"
            });
    }).catch((err)=>{
        console.log(err);
    })
});

app.post('/login', (req, res) => {
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
            return res.json({
                loginSuccess: false, 
                message: "이메일 검색 실패"
            })
        }
        //이메일 있으면 비밀번호 맞는지 확인하고
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."});    
            }
            // return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."});
            
            //비밀번호가 맞다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
    
                //토큰을 저장한다. 쿠키, 로컬스토리지 등에 저장할 수 있다.
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id, message: `환영합니다${user._id}`})
            })
        
        })
    })
    .catch((err) => {
        console.log(err);
    })
    //비밀번호 맞으면 토큰 생성
})

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
    User.findOneAndUpdate({_id: req.user._id}, {toekn: ""})
    .catch((err)=>{
        return res.json({success: false, err});
    })
    .then((user)=>{
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => console.log(`listening on port ${port}!`));