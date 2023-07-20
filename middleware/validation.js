var db = require('../conf/database');
var validator = require('validator');

module.exports = {
    // usernameCheck: function(req, res, next) {
    //     var {username} = req.body;
    //     username = username.trim();
    //     if (!validator.isLength(username, {min:3})) {
    //         req.flash("error", "Username must be at least 3 or more characters");
    //     }

    //     if (!/[a-zA-Z]/.test(username.charAt(0))) {
    //         req.flash("error", "Username must start with a letter");
    //     }

    //     if (req.session.flash.error) {
    //         req.redirect("/register");
    //     } 

    //     else
    //     {
    //         next();
    //     }
    // },

    usernameCheck: function(req, res, next) {
        console.log(req.body); // Debugging statement
    
        var {username} = req.body;
        console.log(username); // Debugging statement
    
        if (!username) {
            req.flash("error", "Username is missing in the request body");
            return res.redirect("/register");
        }
    
        username = username.trim();
      
        if (!validator.isLength(username, { min: 3 })) {
          req.flash("error", "Username must be at least 3 or more characters");
        }
      
        if (!/[a-zA-Z]/.test(username.charAt(0))) {
          req.flash("error", "Username must start with a letter");
        }
      
        if (req.session.flash.error) {
          return res.redirect("/register");
        } else {
          next();
        }
      },
      

    passwordCheck: function (req, res, next) {
        var { password } = req.body;
        if (!validator.isLength(password, { min: 6 })) {
          req.flash("error", "Password must be at least 6 characters");
        }
    
        // Add more password validation rules as needed
    
        if (req.session.flash.error) {
          return res.redirect("/register");
        } else {
          next();
        }
      },
    
      emailCheck: function (req, res, next) {
        var { email } = req.body;
        if (!validator.isEmail(email)) {
          req.flash("error", "Invalid email address");
        }
    
        // Add more email validation rules as needed
    
        if (req.session.flash.error) {
          return res.redirect("/register");
        } else {
          next();
        }
      },
    
      tosCheck: function (req, res, next) {
        var { tos } = req.body;
        if (!tos) {
          req.flash("error", "You must agree to the Terms of Service");
          return res.redirect("/register");
        }
        next();
      },
    
      ageCheck: function (req, res, next) {
        var { age } = req.body;
        if (!validator.isInt(age, { min: 18 })) {
          req.flash("error", "You must be at least 18 years old");
          return res.redirect("/register");
        }
        next();
      },

    isUsernameUnique: async function(req, res, next) {
        var {username} = req.body;

        try 
        {
            var [rows, fields] = await db.execute(`select id from users where username = ?;`, [username]);

            if (rows && rows.length > 0) 
            {
                return res.redirect('/register');
            }
            else
            {
                next();
            }

        } 
        catch (error) 
        {
            next(error);
        }
    },

    isEmailUnique: async function(req, res, next) {
        var {email} = req.body;
        try{
            var [rows, fields] = await db.execute(`select id from users where email = ?;`, [email]);

            if (rows && rows.length > 0) 
            {
                req.flash("error", `${email} is already in use`);
                return res.session.save(function(err){
                    return res.redirect('/register');
                });
            }
            else
            {
                next();
            }

        }catch(error){
            next(error);
        }
    }
};
