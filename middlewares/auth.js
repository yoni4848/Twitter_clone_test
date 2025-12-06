const jwt = require('jsonwebtoken')
const db = require('../database/db')

//get user_id from the jwt token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user_id = decoded.user_id;
        next();
    });
};

//make sure requester owns the post
const checkPostOwnership = async (req, res, next) => {
    try{
        const { id } = req.params;
        const result = await db.query(
            'SELECT user_id FROM posts WHERE post_id = $1', [id]
        );

        if (result.rows.length === 0){
            return res.status(404).json({error: 'post not found'});
        }

        if (result.rows[0].user_id !== req.user_id){
            return res.status(403).json({error: 'can not modify others post'});
        }
        next();
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
};

//make sure requester owns a comment 

const checkCommentOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT user_id FROM comments WHERE comment_id = $1', [id]
        );
        if (result.rows.length === 0){
            return res.status(404).json({error: 'comment not found'});
        }

        if (result.rows[0].user_id !== req.user_id){
            return res.status(403).json({error: 'can not modify others comment'});
        }
        next();

    } catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
};

module.exports = {
    authenticateToken,
    checkPostOwnership,
    checkCommentOwnership
};

