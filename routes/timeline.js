
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middlewares/auth');

//show posts of users followed by an account
router.get('/', authenticateToken, async (req, res) => {
    try{
        const result = await db.query(
        `SELECT posts.*, users.username, users.profile_picture,
        COUNT(likes.post_id) AS like_count,
        EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.post_id AND likes.user_id = $1) AS liked_by_user
        FROM posts
        JOIN users ON posts.user_id = users.user_id
        LEFT JOIN likes ON posts.post_id = likes.post_id
        WHERE posts.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
        GROUP BY posts.post_id, users.username, users.profile_picture
        ORDER BY created_at DESC`, [req.user_id]

        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }

});

module.exports = router;