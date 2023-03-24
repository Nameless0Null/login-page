const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //암호화모듈
const saltRounds = 10; //sort를 만들 때 10자리를 만들어서 비밀번호를 암호화한다.
const jwt = require('jsonwebtoken');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next){ //function이 끝난 후 user.save(())으로 이동
    //비밀번호를 암호화 시킨다.
    var user = this;

    if(user.isModified('password')){//password부분에 변동사항이 생길시에만 동작하게 한다
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){//user의 비밀번호를 가져옴 : user.password
                if(err) return next(err);
                user.password = hash; //입력 받은 비밀번호를 hash된 비밀번호로 교체
                next();
            })//비밀번호
        })
    } else{
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword를 암호화한후 저장돼있는 암호화된 비밀번호와 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        console.log(plainPassword+','+this.password);
        cb(null, isMatch)
    })
}
userSchema.methods.generateToken = function(cb) {
    //jsonwebtoken을 이용해서 token 생성하기
    var user = this;
    
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id+'secretToken' = token
    // 넣으면
    // 'secretToken' -> user._id

    user.token = token

    // user.save(function(err, user){
    //     if(err) return cb(err);
    //     cb(null, user)
    // })
    user.save().catch((err)=>{
        console.log(err);
    }).then((user)=>{
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // user._id + '' = token
    //토큰을 decode
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용하여 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id":decoded, "token":token}).catch((err)=>{
            console.log(err);
        })
        .then((user) => {
            cb(null, user);
        })
        // User.findOne({email: req.body.email}).then((user) => {
        //     if(!user){
        //         return res.json({
        //             loginSuccess: false, 
        //             message: "이메일 검색 실패"
        //         })
        //     }
    })

    // jwt.verify(token, 'wrong-secret', function(err, decoded) {
    //     // err
    //     // decoded undefined
    //   });
}

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema)

module.exports = {User}