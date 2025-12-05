const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//authenticate a user
router.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;

        if (!username || !password){
            return res.status(400).json({error: 'missing required field'});
        }
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1', [username]
        );

        if(result.rows.length === 0){
            return res.status(404).json({error: 'invalid username or password'});
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid){
            return res.status(401).json({error: 'invalid username or password'});
        }
        delete user.password_hash;

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.status(200).json({user, token});

    } catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

module.exports = router;
