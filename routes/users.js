const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middlewares/auth');

//get all the users
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database error'
        });
    }
});

//insert a new user to the database
router.post('/', async (req, res) => {
    try {

        const { username, email,password } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }


        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);


        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, password_hash]
        );

        const user = result.rows[0];
        delete user.password_hash;

        res.status(201).json(user);
    } catch (err) {
        console.error(err);

        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Username or email already exists'
            });
        }

        res.status(500).json({
            error: 'Database error'
        });
    }
});

//delete a certain user from the database
router.delete('/:id', authenticateToken ,async (req, res) => {

    try {

        const result = await db.query(
            'DELETE FROM users WHERE user_id = $1', [req.user_id]
        );
        if (result.rowCount === 0){
            return res.status(404).json({error: 'user not found'});
        }

        res.status(200).json({message: 'user deleted successfully'});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "database error"});
    }
});

//find a user by its user id
router.get('/:id', async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const result = await db.query(
            'SELECT user_id, username, email, bio, profile_picture, age, created_at FROM users WHERE user_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'user not found'
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'database error'
        });

    }
});

//update user's info
router.put('/:id', authenticateToken , async (req, res) => {

    try {
        const { bio, age, profile_picture } = req.body;
        const result = await db.query(
            'UPDATE users SET bio = $1, age = $2, profile_picture = $3 WHERE user_id = $4 RETURNING *', [bio, age, profile_picture, req.user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'user not found'
            });
        }
        const user = result.rows[0];
        delete user.password_hash;

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'database error'
        });
    }
});

module.exports = router;
