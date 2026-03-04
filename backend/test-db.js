const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/evidenceDB';

console.log('Attempting to connect to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: MongoDB Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Connection failed');
        console.error(err);
        process.exit(1);
    });
