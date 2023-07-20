const {error} = require('console');
var pathToFFMPEG = require('ffmpeg-static');
var exec = require('child_process').exec;
var db = require('../conf/database');

module.exports = {
    makeThumbnail: function (req, res, next) {
        if (!req.file) {
            next(new Error("File upload failed"));
        } else {
            try {
                var destinationOfThumbnail = `public/images/uploads/thumbnail-${req.file.filename.split(".")[0]}.png`;

                var thumbnailCommand = `${pathToFFMPEG} -ss 00:00:01 -i ${req.file.path} -y -s 200x200 -vframes 1 -f image2 ${destinationOfThumbnail}`;

                exec(thumbnailCommand, function(error, stdout,stderr){
                    if(error) next(error);
                    console.log(stdout);
                    console.log(stderr);
                    //save thumbnail path to req.file
                    //call next
                  });
                  req.file.thumbnail = destinationOfThumbnail;
                  next();
            } catch (error) {
                next(error);
            }
        }
    },

    getPostsForuserBy: function (req, res, next){},

    getPostsById: async function (req, res, next){
        var {id} = req.params;

        try{
            let [rows, _ ] = await db.execute(
                `SELECT u.username, p.video, p.title, p.description, 
                p.id, p.createdAt
                from posts p
                JOIN users u
                ON p.fk_userId=u.id
                WHERE p.id=?;`,[id]
            );

            const post = rows[0];
            if(!post)
            {
                return res.status(404).json({ error: 'Post not found' });
            }
            else{
                res.locals.currentPost = post;
                next();
            }

        } catch (error){
            next(error);
        }
    },

    getCommentsForPostById: async function (req, res, next){
        var {id} = req.params;

        try{
            let [rows, _ ] = await db.execute(
                `SELECT c.text, c.createdAt
                from comments c
                JOIN users u
                ON c.fk_authorId=u.id
                WHERE c.fk_postId=?;`,[id]
            );

            const post = rows[0];

            res.locals.currentPost.comments = rows;
            next();
        } catch (error){
            next(error);
        }
    },

    getRecentPosts: async function (req, res, next){
        try{
            var [rows, _ ] = await db.execute(`SELECT * FROM posts ORDER BY createdAt DESC LIMIT 10;`);
            res.locals.posts = rows;
            return res.render('index');

        }catch (error){
                next(error);
            }
            next();
        }  
};