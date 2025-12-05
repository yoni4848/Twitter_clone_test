const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middlewares/auth');

//create a new post
router.post ('/', authenticateToken, async(req, res) => {

    try{

        const { content } = req.body;

        if (!content){
            return res.status(400).json({error: 'Missing reqired fields'});
        }
        const result = await db.query(
            'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [req.user_id, content]
        );

        res.status(201).json(result.rows[0]);
    } catch(err){
        if (err.code === '23503'){
            return res.status(404).json({error: 'User not found'});
        }

        res.status(500).json({error: 'database error'});
    }
} );

//get all posts
router.get ('/', async (req, res) => {
    try{
        const result = await db.query(
            'SELECT * FROM posts'
        );
        res.status(200).json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});


//access a specific post
router.get ('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM posts WHERE post_id = $1', [id]
        );

        if (result.rows.length === 0){
            return res.status(404).json({error: 'Post id not found'});
        }

        res.status(200).json(result.rows[0]);
    } catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

//delete a specific post
router.delete ('/:id',authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const result = await db.query(
            'DELETE FROM posts WHERE post_id = $1 AND user_id = $2',
            [id, req.user_id]
        );
        if ((result).rowCount === 0){
            return res.status(404).json({error: 'post not found'});
        }

        res.status(200).json(result.rows[0]);
    } catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

//like a post
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {

       const {id} = req.params;

        const result = await db.query(
            'INSERT INTO likes (user_id, post_id) VALUES($1, $2) RETURNING *', [req.user_id, id]
        );

        res.status(201).json(result.rows[0]);

    } catch(err){
        console.error(err);

        if (err.code === '23503'){
            return res.status(404).json({error: 'post or user not found'});
        }
        else if (err.code === '23505'){
            return res.status(409).json({error: 'post already liked'});
        }

        res.status(500).json({error: 'database error'});

    }


});

//unlike a post
router.delete('/:id/like', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [req.user_id, id]
        );

        if (result.rowCount === 0){
            return res.status(404).json({error: 'Post is not liked'});
        }

        res.status(200).json({message: 'post unliked successfully'});

    } catch(err){
        console.error(err);

        if (err.code === '23503'){
            return res.status(404).json({error: 'user_id or post_id not found'});
        }

        res.status(500).json({error: 'database error'});

    }
});

//see who liked a post
router.get('/:id/likes', async (req, res) =>{
    try{
        const { id } = req.params;
        const result = await db.query(
            'SELECT users.user_id, users.username, users.profile_picture, likes.created_at FROM likes JOIN users ON likes.user_id = users.user_id WHERE likes.post_id = $1', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

//write a comment under a post
router.post('/:id/comments',authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;
        const { content } = req.body;

        if (!content){
            return res.status(400).json({error: 'Missing required fields'});
        }
        const result = await db.query(
            'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *', [req.user_id, id, content]
        );

        res.status(201).json(result.rows[0]);

    }catch(err){
        console.error(err);

        if (err.code === '23503'){
            return res.status(404).json({error: 'user/post not found'});
        }

        res.status(500).json({error: 'database error'});

    }
});

//see all the comments under a post
router.get('/:id/comments', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'SELECT comments.*, users.user_id, users.username, users.profile_picture FROM comments JOIN users ON comments.user_id = users.user_id WHERE comments.post_id = $1 ORDER BY comments.created_at ASC', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});

    }
});

module.exports = router;
