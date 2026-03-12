const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const { updateUsersCSV } = require('./routes/admin');

const seedDB = async () => {
    try {
        fs.writeFileSync('uri.txt', String(process.env.MONGO_URI));
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        const csvPath = path.join(__dirname, '..', 'users_credentials.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const lines = fileContent.trim().split('\n');

        // skip header
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length < 5) continue;

            const email = row[1];

            let user = await User.findOne({ email });
            if (!user) {
                user = new User({
                    name: row[0],
                    email: email,
                    role: row[2].toLowerCase(),
                    status: row[3],
                    password: row[4],
                    plainPassword: row[4],
                    createdAt: new Date(row[5])
                });
                await user.save();
                console.log(`User ${email} created.`);
            } else {
                console.log(`User ${email} already exists. Skipping.`);
            }
        }

        console.log('Seeding complete. Generating updated CSV...');
        await updateUsersCSV();
        console.log('Done.');
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('error.txt', String(error.message || error.stack || error));
        console.error(error);
        process.exit(1);
    }
};

seedDB();
