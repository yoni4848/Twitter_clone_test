const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
    try{
        const result = await db.query(
            'SELECT posts.*, users.username, users.profile_picture, COUNT(likes.post_id) AS like_count FROM posts JOIN users ON posts.user_id = users.user_id LEFT JOIN likes ON posts.post_id = likes.post_id GROUP BY posts.post_id, users.username, users.profile_picture ORDER BY like_count DESC'

        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }

});

module.exports = router;
