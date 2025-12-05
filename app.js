const express = require('express');
const db = require('./database/db')
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
const jwt = require('jsonwebtoken')


const PORT = 3000;

//get user_id from the jwt token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user_id = decoded.user_id;
        next();
    });
};

//get all the users
app.get('/api/users', async (req, res) => {
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
app.post('/api/users', async (req, res) => {
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
app.delete('/api/users/:id', authenticateToken ,async (req, res) => {
   
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
app.get('/api/users/:id', async (req, res) => {
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
app.put('/api/users/:id', authenticateToken , async (req, res) => {

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

//create a new post
app.post ('/api/posts', authenticateToken, async(req, res) => {

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
app.get ('/api/posts', async (req, res) => {
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
app.get ('/api/posts/:id', async (req, res) => {
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
app.delete ('/api/posts/:id',authenticateToken, async (req, res) => {
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
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
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
app.delete('/api/posts/:id/like', authenticateToken, async (req, res) => {
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
app.get('/api/posts/:id/likes', async (req, res) =>{
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
app.post('/api/posts/:id/comments',authenticateToken, async (req, res) => {
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
app.get('/api/posts/:id/comments', async (req, res) => {
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

//delete a specific post
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
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


//follow a user
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;

        if (parseInt(req.user_id) === parseInt(id)){
            return res.status(400).json({error: 'Cannot follow yourself'});
        }

        const result = await db.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *', [req.user_id, id]
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
app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
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
app.get('/api/users/:id/followers', async (req, res) => {
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
app.get('/api/users/:id/following', async (req, res) => {
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

//authenticate a user
app.post('/api/auth/login', async (req, res) => {
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

//check if the app is working
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

//version check the app
app.get('/api/info', (req, res) => {
    res.json({
        project: 'Twitter clone',
        version: 1.0
    });
});

//success message when the app is connected to the localhost
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
