const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middlewares/auth');

//follow a user
router.post('/:id/follow', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;

        if (parseInt(req.user_id) === parseInt(id)){
            return res.status(400).json({error: 'Cannot follow yourself'});
        }

        const result = await db.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *', [req.user_id, id]
        );
        await db.query(
            'INSERT INTO notifications (user_id, type, from_user_id) VALUES ($1, $2, $3)',
            [id, 'follow', req.user_id]
        );

        res.status(201).json(result.rows[0]);

    }catch(err){
        console.error(err);

        if (err.code === '23503'){
            return res.status(404).json({error: 'user not found'});
        }
        else if (err.code === '23505'){
            return res.status(409).json({error: 'already following this user'});
        }

        res.status(500).json({error: 'database error'});
    }
});

// unfollow a user
router.delete('/:id/follow', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [req.user_id, id]
        );

        if (result.rowCount === 0){
            return res.status(404).json({error: 'not following this user'});
        }

        res.status(200).json({message: 'unfollowed successfully'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

// see followers of a user
router.get('/:id/followers', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'SELECT users.user_id, users.username, users.profile_picture, users.bio, follows.created_at FROM follows JOIN users ON follows.follower_id = users.user_id WHERE follows.following_id = $1', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

//see who a person is following
router.get('/:id/following', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'SELECT users.user_id, users.username, users.profile_picture, users.bio, follows.created_at FROM follows JOIN users ON follows.following_id = users.user_id WHERE follows.follower_id = $1', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

module.exports = router;
