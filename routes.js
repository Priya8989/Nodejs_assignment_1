const fs = require('fs');
const path = require('path');
const utils = require('./utils');

// Routes handler to manage incoming requests
const routes = {
    handleRequest: (req, res) => {
        const { url, method } = req;

        // Serve the homepage (GET /)
        if (url === '/' && method === 'GET') {
            serveHomePage(req, res);
        }
        // Add a new user (POST /add-user)
        else if (url === '/add-user' && method === 'POST') {
            addUser(req, res);
        }
        // Get the list of users (GET /users)
        else if (url === '/users' && method === 'GET') {
            getUsers(req, res);
        }
        // Handle 404 Not Found for all other routes
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    }
};

// Serve the homepage HTML file
function serveHomePage(req, res) {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    });
}

// Add a new user (POST /add-user)
function addUser(req, res) {
    let body = '';

    // Collect the data from the POST request body
    req.on('data', chunk => {
        body += chunk.toString();
    });

    // Once the request body is fully received, process the data
    req.on('end', () => {
        try {
            const userData = JSON.parse(body);
            const { firstName, lastName } = userData;

            // Validate input (ensure both first and last names are provided)
            if (!firstName || !lastName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'First name and last name are required' }));
                return;
            }

            // Validate that names contain only letters and do not exceed 50 characters
            if (!/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Names must only contain letters' }));
                return;
            }

            if (firstName.length > 50 || lastName.length > 50) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Names cannot exceed 50 characters' }));
                return;
            }

            // Check if the user already exists
            const usersData = utils.readUsersFromFile();
            const userExists = usersData.some(user =>
                user.firstName.toLowerCase() === firstName.toLowerCase() &&
                user.lastName.toLowerCase() === lastName.toLowerCase()
            );

            if (userExists) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User already exists' }));
                return;
            }

            // Save the new user data
            usersData.push({ firstName, lastName });
            const isSaved = utils.writeUsersToFile(usersData);

            if (!isSaved) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to save user data' }));
                return;
            }

            // Successfully added the user
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User added successfully' }));

        } catch (error) {
            // Handle invalid JSON format
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON format' }));
        }
    });
}

// Get all users (GET /users)
function getUsers(req, res) {
    try {
        const usersData = utils.readUsersFromFile();

        if (usersData.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No users found. Please add users at /add-user' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(usersData));

    } catch (error) {
        // Handle any internal server error (e.g., file read failure)
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
}

module.exports = routes;
