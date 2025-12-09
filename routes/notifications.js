const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middlewares/auth');


// Get all notifications for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT notifications.*, users.username, users.profile_picture FROM notifications JOIN users ON notifications.from_user_id = users.user_id WHERE notifications.user_id = $1 ORDER BY created_at DESC',[req.user_id]
        );
        res.status(200).json(result.rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});




