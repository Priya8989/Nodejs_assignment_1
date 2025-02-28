const http = require('http');
const routes = require('./routes');

// Create and start the server
const server = http.createServer((req, res) => {
    routes.handleRequest(req, res);
});

// Listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});