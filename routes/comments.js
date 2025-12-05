const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middlewares/auth');

//delete a specific post
router.delete('/:id', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM comments WHERE comment_id = $1', [id]
        );

        if (result.rowCount === 0){
            return res.status(404).json({error: 'comment not found'});
        }

        res.status(200).json({message: 'comment deleted successfully'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

module.exports = router;
