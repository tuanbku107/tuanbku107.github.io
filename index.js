const express = require('express')
    , passport = require('passport')
    , InstagramStrategy = require('passport-instagram').Strategy
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , config = require('./config/config.js')
    , app = express()
    , axios = require('axios');


// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


// Use the InstagramStrategy within Passport.

passport.use(new InstagramStrategy({
    clientID: config.INSTAGRAM_CLIENT_ID,
    clientSecret: config.INSTAGRAM_CLIENT_SECRET,
    callbackURL: config.callback_url
},
    function (accessToken, refreshToken, profile, done) {
        console.log('run ere');
        var user = {
            "profile": profile,
            "accessToken": accessToken
        };
        process.nextTick(function () {
            return done(null, user);
        });
    }
));


app.set('views', __dirname + '/index.html');
app.set('view engine', 'html');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + ''));

app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/auth/instagram', passport.authenticate('instagram'));


app.get('/auth/instagram/callback',
    passport.authenticate('instagram'),
    function (req, res) {
        console.log('res::', res);
        if (req.user) {
            console.log('check callback::', req.user.accessToken);
            async function callInstagramAPI() {
                // let response = await axios.get(`https://graph.facebook.com/v6.0/me/accounts?access_token=${access_token}`);

                let response = await axios.get(`https://api.instagram.com/oauth/authorize?client_id=1003656400035105
                &redirect_uri=https://tuanbku107.github.io/auth/instagram/callback
                &scope=user_profile,user_media
                &response_type=code`);
                return response;
            }
            callInstagramAPI()
                .then(response => {
                    console.log("data::::", response.data);
                    res.send(response.data);
                })
        }
        // res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}
//api
// app.get('/api/auth', (req, res) => {
//     async function callInstagramAPI() {
//         // let response = await axios.get(`https://graph.facebook.com/v6.0/me/accounts?access_token=${access_token}`);

//         let response = await axios.get(`https://api.instagram.com/oauth/authorize?client_id=1003656400035105
//         &redirect_uri=https://tuanbku107.github.io/auth/instagram/callback
//         &scope=user_profile,user_media
//         &response_type=code`);
//         return response;
//     }
//     callInstagramAPI()
//         .then(response => {
//             // console.log("data::::", response.data);
//             res.send("response.data");
//         })
// });


app.listen(process.env.PORT || 3000);