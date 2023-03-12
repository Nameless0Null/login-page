const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');

const {User} = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application.json
app.use(bodyParser.json());

const config = require('./config/key')
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))





app.get('/', (req, res) => res.send('Hello Wolrd!'));

app.post('/register', (req, res) => {
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
            success: true
            });
    }).catch((err)=>{
        console.log(err);
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));