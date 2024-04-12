/*********************************************************************************
*  WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
* Name: Vinicius Souza da Silva Student ID: 135067221 Date: 12/04/2024
* Published URL: https://tame-ruby-penguin-gear.cyclic.app/
*********************************************************************************/

require('dotenv').config();
const legoData = require("./modules/legoSets.js");
const express = require('express');
const mongoose = require('mongoose');
const authData = require('./modules/auth-service.js');
const clientSessions = require('client-sessions');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(clientSessions ({
  cookieName: "session",
  secret: process.env.SESSION_KEY,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected', process.env.MONGODB_URI);
    initializeServices();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function initializeServices() {
  try {
    await legoData.initialize();
    await authData.initialize();
    console.log('Data services initialized successfully.');
    app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`));
  } catch (err) {
    console.error('Failed to initialize data services:', err);
    process.exit(1);
  }
}

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
})

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  res.render("home");
})

app.get('/about', (req, res) => {
  res.render("about");
})

app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
  try {
    const setNum = req.params.num;

    const set = await legoData.getSetByNum(setNum);
    const themes = await legoData.getAllThemes();
    res.render('editSet', { themes, set });

  } catch (error) {
    res.status(404).render('404', { message: error.message });
  }
});

app.post('/lego/editSet', ensureLogin, async (req, res) => {
  try {
    const setData = req.body;
    const setNum = setData.set_num;

    await legoData.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
})

app.get('/lego/sets', async (req, res) => {
  try {
    let legoSets;
    var theme = req.query.theme;

    if (theme) {
      legoSets = await legoData.getSetsByTheme(theme);
    } else {
      legoSets = await legoData.getAllSets();
    }

    res.render("sets", { sets: legoSets })
  } catch (error) {
    if (theme) {
      res.status(404).render("404", { message: "No Sets found for a matching theme" });
    } else {
      res.status(404).render("404", { message: "No Sets found for a specific set num" });
    }

  }
});

app.get('/lego/addSet', ensureLogin, async (req, res) => {
  let legoSets = await legoData.getAllThemes();

  if (legoSets) {
    res.render("addSet", { set: legoSets });
  } else {
    res.status(404).render("404", { message: "Not able to run the database" });
  }
})

app.post('/lego/addSet', ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

app.get('/lego/deleteSet/:num', ensureLogin, async (req, res) => {
  try {
    const setNum = req.params.num;

    if (!setNum) {
      throw new Error('Set number is missing');
    }

    await legoData.deleteSet(setNum);

    res.redirect('/lego/sets');
  } catch (error) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

app.get('/lego/sets/:set_num', async (req, res) => {
  try {
    const setNum = req.params.set_num;
    const legoSets = await legoData.getSetByNum(setNum);

    if (legoSets) {
      res.render("set", { set: legoSets })
    } else {
      res.status(404).render("404", { message: "No Sets found for a specific set num" });
    }
  } catch (error) {

    res.status(404).render("404", { message: "No Sets found for a specific set num" });
  }
})

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: '' });
});

app.get('/register', (req, res) => {
  res.render('register', { successMessage : '', errorMessage : ''});
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch(err => {
      res.render('register', { errorMessage: err, successMessage: "", userName: req.body.userName });
    });
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
})

app.get('*', (req, res) => {
  res.status(404).render("404", { message: "No view matched for a specific route" });
});

connectDB().then(() => {
  app.listen(process.env.MONGOPORT, () => {
    console.log("Server is running");
  })
});