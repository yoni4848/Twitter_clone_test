const express = require('express');
const db = require('./database/db')
const app = express();
app.use(express.json());

const PORT = 3001; // Different port to avoid conflicts

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');
// EXCLUDING timeline and explore routes
// const timelineRoutes = require('./routes/timeline');
// const exploreRoutes = require('./routes/explore');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
// EXCLUDING timeline and explore routes
// app.use('/api/timeline', timelineRoutes);
// app.use('/api/explore', exploreRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
