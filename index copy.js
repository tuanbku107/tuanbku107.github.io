const express = require('express')
    , passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy
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


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
},
    function (accessToken, refreshToken, profile, done) {
        var user = {
            "profile": profile,
            "accessToken": accessToken
        };
        process.nextTick(function () {
            return done(null, user);
        });
    }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook'));


app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    function (req, res) {
        if (req.user) {
            console.log('check callback::', req.user.accessToken);
            // async function callInstagramAPI(access_token) {
            //     // let response = await axios.get(`https://graph.facebook.com/v6.0/me/accounts?access_token=${access_token}`);
            //     let response = await axios.get(`https://graph.instagram.com/v6.0/me/accounts?access_token=${access_token}`);
            //     return response;
            // }
            // callInstagramAPI(req.user.accessToken)
            //     .then(response => {
            //         console.log("data::::", response.data);
            //     })
            async function callInstagramAPI() {
                // let response = await axios.get(`https://graph.facebook.com/v6.0/me/accounts?access_token=${access_token}`);

                let response = await axios.get(`https://api.instagram.com/oauth/authorize?client_id=1003656400035105
                &redirect_uri=http://localhost:3000/
                &scope=user_profile,user_media
                &response_type=code`);
                return response;
            }
            callInstagramAPI()
                .then(response => {
                    // console.log("data::::", response.data);
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
app.get('/api/auth', (req, res) => {
    async function callInstagramAPI() {
        // let response = await axios.get(`https://graph.facebook.com/v6.0/me/accounts?access_token=${access_token}`);

        let response = await axios.get(`https://api.instagram.com/oauth/authorize?client_id=1003656400035105
        &redirect_uri=http://localhost:3000/auth/facebook/callback
        &scope=user_profile,user_media
        &response_type=code`);
        return response;
    }
    callInstagramAPI()
        .then(response => {
            // console.log("data::::", response.data);
            res.send(response.data);
        })
});


app.listen(process.env.PORT || 3000);