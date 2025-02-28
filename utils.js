const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.txt');

// Read users from the file
function readUsersFromFile() {
    try {
        if (!fs.existsSync(usersFilePath)) {
            fs.writeFileSync(usersFilePath, '[]');
            return [];
        }

        const fileContent = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading users file:', error);
        return []; // Return empty array if there's an error
    }
}

// Write users to the file
function writeUsersToFile(users) {
    try {
        // Convert the users array to JSON and write to the file
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing to users file:', error);
        return false; // Return false if there's an error
    }
}

module.exports = {
    readUsersFromFile,
    writeUsersToFile
};
