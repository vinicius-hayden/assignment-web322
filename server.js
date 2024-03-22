/*********************************************************************************
*  WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
* Name: Vinicius Souza da Silva Student ID: 135067221 Date: 03/07/2024
* Published URL: 
*********************************************************************************/

const legoData = require("./modules/legoSets.js");
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.listen(HTTP_PORT, () => {
    console.log(`$Server listening on ${HTTP_PORT}`);
    legoData.initialize();
})


app.get('/', (req,res) => {
    res.render("home");
})

app.get('/about', (req, res) => {
    res.render("about");
})

app.get('/lego/sets', async (req, res) => {
    console.log('/lego/sets');
    try {
        let legoSets;
        var theme = req.query.theme;

        if (theme) {
            legoSets = await legoData.getSetsByTheme(theme);
        } else {
            legoSets = await legoData.getAllSets();
        }
           
        res.render("sets", {sets: legoSets})
    } catch (error) {
        if (theme) {
            res.status(404).render("404", {message: "No Sets found for a matching theme"});
        } else {
            res.status(404).render("404", {message: "No Sets found for a specific set num"});
        }
        
    }
});

app.get('/lego/addSet', async (req, res) => {
    let legoSets = await legoData.getAllThemes();

    if (legoSets) {
        res.render("addSet", {set: legoSets});
    } else {
        res.status(404).render("404", {message: "Not able to run the database"});
    }

    
})

app.get('/lego/sets/:set_num', async (req, res) => {
    console.log('/lego/sets/:set_num');
    try {
        const setNum = req.params.set_num;
        const legoSets = await legoData.getSetByNum(setNum);

        if (legoSets) {
            res.render("set", {set: legoSets})
        } else {
            res.status(404).render("404", {message: "No Sets found for a specific set num"});
        }
    } catch (error) {

        res.status(404).render("404", {message: "No Sets found for a specific set num"});
    }
})

app.get('*', (req, res) => {
    res.status(404).render("404", {message: "No view matched for a specific route"});
});