const express = require('express');
const path = require('path');
const fotionWebRouter = express.Router();

fotionWebRouter.use(express.static(path.join(__dirname, '..', 'fotionWeb')));

// Handle SPA (Single Page Application) by redirecting all requests to 'index.html'
fotionWebRouter.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'fotionWeb/index.html'));
});

module.exports = fotionWebRouter;

