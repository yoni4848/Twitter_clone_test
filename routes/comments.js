const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken, checkCommentOwnership } = require('../middlewares/auth');

//delete a specific post
router.delete('/:id', authenticateToken, checkCommentOwnership, async (req, res) => {
    try{
        const { id } = req.params;

        await db.query(
            'DELETE FROM comments WHERE comment_id = $1', [id]
        );

        res.status(200).json({message: 'comment deleted successfully'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

module.exports = router;
