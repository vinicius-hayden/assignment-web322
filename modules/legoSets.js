/*********************************************************************************
*  WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
* Name: Vinicius Souza da Silva Student ID: 135067221 Date: 02/01/2024
*********************************************************************************/

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];

function initialize() {
  return new Promise(function (resolve) {
    setData.forEach((data, index) => {
      sets[index] = data;
      let themeName;
      themeData.forEach((theme) => {
        if (data.theme_id === theme.id) {
          themeName = theme.name;
        }
      });
      sets[index].theme = themeName;
    });
    resolve();
  })
}

async function getAllSets() {
  return new Promise(function (resolve) {
    sets.forEach((data) => {
      console.log(data);
    });
    resolve(sets);
  })
}

async function getSetByNum(setNum) {
  // my solution
  // sets.forEach((data) => {
  //     if (data.set_num === setNum) {
  //         console.log(data);
  //     };
  // })

  //suggested solution
  return new Promise (function (resolve, reject) {
    const result = sets.find(({ set_num }) => set_num === setNum);
    console.log(result);
    if (result == undefined) {
      reject("Unable to find request set");
    } else {
      resolve(result);
    }
  })
  
}

async function getSetsByTheme(theme) {
  return new Promise(function(resolve, reject) {
    if (typeof theme !== 'string') {
      reject("Theme must be a string");
      return;
    }
    
    const results = sets.filter((data) => !data.name.toLowerCase().includes(theme.toLowerCase()));
    console.log(results);
    if (results) {
      resolve(results);
    } else {
      reject("Unable to find requested sets");
    }
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };