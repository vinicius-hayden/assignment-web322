const mongoose = require('mongoose');
const bcrpyt = require('bcryptjs')

let Schema = mongoose.Schema;
let dotenv = require('dotenv').config();

const userLoginSchema = new Schema({
    dateTime: Date,
    userAgent: String,
});

const userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory: [userLoginSchema],
});

let User;

function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_URI);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

async function registerUser(userData) {
    return new Promise(async (resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            try {
                let newUser = new User(userData);

                try {
                    const hash = await bcrpyt.hash(userData.password, 10);
                    newUser.password = hash;
                    await newUser.save();
                    resolve();
                } catch (err) {
                    reject(err);
                }

                await newUser.save();
                resolve();
            } catch (err) {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the use: ", err);
                }
            }

        }
    });
}

async function checkUser(userData) {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({ userName: userData.userName });

            if (users.length === 0) {
                reject("Unable to find user: " + userData.userName);
                return;
            }

            const user = users[0];

            bcrpyt.compare(userData.password, user.password).then((result) => {
                if (result === false) {
                    reject("Incorrect Password for user: " + userData.userName);
                    return;
                } 
            })

            if (user.loginHistory.length === 8) {
                user.loginHistory.pop();
            }

            user.loginHistory.unshift({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });

            const updatedUser = await User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } });

            if (updatedUser.matchedCount !== 1) {
                reject("There was an error verifying the user: " + JSON.stringify(updatedUser));
                return;
            }

            resolve(user);
        } catch (error) {
            reject("Unable to find user: " + userData.userName);
        }
    });
}



module.exports = { initialize, registerUser, checkUser };