


const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser'); // Import body-parser for raw body parsing
const { Server } = require("socket.io");
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);  // Create an HTTP server and pass your app to it
const port = process.env.PORT || 8080;
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    maxHttpBufferSize: 4e6 // 4Mb
});
//require('dotenv').config();
//console.log(process.env)


const prisma = new PrismaClient();


const fotionRouter = require("./routers/fotionRouter.js")(io, prisma);
const fotionWebRouter = require("./routers/fotionWebRouter.js");



app.use(cors());

// app.use((req, res, next) => {
//     console.log("Request URL: ", req.url);
//     next();
// });

app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https' || req.headers.host === `localhost:${port}`) {
        // Request was via https, so do no special handling
        next();
    } else {
        // Request was via http, so redirect to https
        res.redirect(`https://${req.headers.host}${req.url}`);
    }
});

app.use(function (req, res, next) {
    if (req.headers.host === `localhost:${port}`) return next();
    let bareHost = req.headers.host.split(":")[0]; // Extract the hostname without the port
    // Extract the middle part of the domain name
    let hostParts = bareHost.split('.');
    if (hostParts.length > 2) {
        bareHost = hostParts.slice(1, -1).join('.'); // Join the middle parts
    } else {
        bareHost = hostParts[0]; // For single part domains or local development
    }

    let subdomain = req.headers.host.split(".")[0];
    if (subdomain === "localhost:8080" || subdomain === "localhost:3000") {
        // Keep localhost subdomains for local testing
        req.url = "/" + bareHost + "/" + subdomain + req.url;
    } else if (hostParts.length < 3) {
        // Replace with 'www' if no subdomain is present
        req.url = "/" + bareHost + "/www" + req.url;
    } else {
        // Use existing subdomain if present
        req.url = "/" + bareHost + "/" + subdomain + req.url;
    }

    console.log("Final URL: ", req.protocol + '://' + req.get('host') + req.url);
    next();
});



// Middleware to conditionally parse JSON
const conditionalJsonParser = (req, res, next) => {
    if (req.url.startsWith('/levneprojektory/api/stripe-webhooks')) {
        // If the route is for Stripe webhooks, skip JSON parsing
        return next();
    }
    // For all other routes, use JSON parser
    return bodyParser.json()(req, res, next);
};


// Apply the conditional JSON parser globally
app.use(conditionalJsonParser);


app.use("/ranajakub/fotionapi", fotionRouter);
app.use("/ranajakub/fotion", fotionWebRouter);


// Use the HTTP server to listen, not the Express app
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

