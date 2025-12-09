const express = require('express');
const db = require('./database/db')
const app = express();
app.use(express.json());


const PORT = 3000;

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');
const timelineRoutes = require('./routes/timeline');
const exploreRoutes = require('./routes/explore');
const searchRoutes = require('./routes/search');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/search', searchRoutes);

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
