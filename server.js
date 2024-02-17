/*********************************************************************************
*  WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
* Name: Vinicius Souza da Silva Student ID: 135067221 Date: 02/16/2024
*********************************************************************************/

const legoData = require("./modules/legoSets.js");
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');

app.use(express.static('public'));

app.listen(HTTP_PORT, () => {
    console.log(`$Server listening on ${HTTP_PORT}`);
    legoData.initialize();
})


app.get('/', (req,res) => {
    // res.send( "Assignment 2: Vinicius H Souza da Silva - 135067221");
    // res.send("/views/home.html")
    res.sendFile(path.join(__dirname, '/views/home.html'));
})

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
})

app.get('/lego/sets', async (req, res) => {
    try {
        let sets;
        const theme = req.query.theme;

        if (theme) {
            sets = await legoData.getSetsByTheme(theme);
        } else {
            sets = await legoData.getAllSets();  
        }
           
        res.json(sets);
    } catch (error) {
        console.log(error);
        res.sendFile(path.join(__dirname, '/views/404.html'));
    }
});

app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const setNum = req.params.set_num;
        const sets = await legoData.getSetByNum(setNum);

        if (sets) {
            res.json(sets)
        } else {
            res.sendFile(path.join(__dirname, '/views/404.html'));
        }
    } catch (error) {
        console.log(error);
        res.sendFile(path.join(__dirname, '/views/404.html'));
    }
})

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        if (theme) {
            const sets = await legoData.getSetsByTheme(theme);
            res.json(sets);
        } else {
            res.sendFile(path.join(__dirname, '/views/404.html'));
        }
    } catch (error) {
        console.log(error);
        res.sendFile(path.join(__dirname, '/views/404.html'));
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
});