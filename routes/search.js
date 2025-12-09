const express = require('express');
const router = express.Router();
const db = require('../database/db');


//search for posts using a keyword
router.get('/posts', async (req, res) => {
    try{
        const { q } = req.query;
        if (!q){
            return res.status(400).json({error: 'missing a keyword to search'});
        }
        const keyword = `%${q}%`
        const result = await db.query(
            'SELECT posts.*, users.username, users.profile_picture FROM posts JOIN users ON posts.user_id = users.user_id WHERE content ILIKE $1', [keyword]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

//search users by using their username

router.get('/users', async (req, res) => {
    try{
        const { q } = req.query;
        if(!q){
            return res.status(400).json({error: 'missing keyword to search'});
        }
        const keyword = `%${q}%`;

        const result = await db.query(
            'SELECT username, user_id, profile_picture, bio, created_at FROM users WHERE username ILIKE $1', [keyword]
        )

        res.status(200).json(result.rows);

    } catch(error){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

module.exports = router;