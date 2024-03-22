/*********************************************************************************
*  WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
* Name: Vinicius Souza da Silva Student ID: 135067221 Date: 22/03/2024
*********************************************************************************/

const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

dotenv.config();


const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },

},

  {
    createdAt: false,
    updatedAt: false,
  }

);

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  year: {
    type: Sequelize.INTEGER
  },
  num_parts: {
    type: Sequelize.INTEGER
  },
  theme_id: {
    type: Sequelize.INTEGER
  },
  img_url: {
    type: Sequelize.STRING
  }
}
  ,
  {
    createdAt: false,
    updatedAt: false,
  }

);

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return new Promise(function (resolve, reject) {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      })
  })
}

async function getAllSets() {
  return new Promise(async (resolve, reject) => {
    try {
      const allSets = Set.findAll({ include: [Theme.name] });
      resolve(allSets);
    } catch (error) {
      reject(new Error(error));
    }
  });
}

async function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      const allThemes = Theme.findAll();
      resolve(allThemes);
    } catch (error) {
      reject(new Error(error));
    }
  })
}

async function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Set.findOne({ where: { set_num: setNum }, include: [Theme] });

      if (!result) {
        reject("Unable to find requested set");
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(new Error(`Error finding set: ${error.message}`));
    }
  });
}

async function getSetsByTheme(theme) {
  return new Promise(async (resolve, reject) => {
    try {
      const sets = await Set.findAll({
        include: [Theme],
        where: {
          '$Theme.name$': {
            [Sequelize.Op.iLike]: `%${theme}%`
          }
        }
      });

      if (sets.length > 0) {
        resolve(sets);
      } else {
        reject("Unable to find requested sets");
      }
    } catch (error) {
      reject(new Error(error));
    }
  });
}

async function addSet(setData) {
  console.log('setData:', setData);
  return new Promise(async (resolve, reject) => {
    try {
      initialize();
      await Set.create({
        name: setData.name,
        year: setData.year,
        num_parts: setData.num_parts,
        img_url: setData.img_url,
        theme_id: setData.theme_id,
        set_num: setData.set_num,
      });
      resolve();
    } catch (error) {
      reject(new Error(error));
    }

  });
}

async function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rowsUpdated, [updatedSet]] = await Set.update(setData, {
        where: { set_num: set_num },
        returning: true
      });

      if (rowsUpdated === 0) {
        throw new Error('Set not found or not updated');
      }

      resolve(updatedSet);
    } catch (error) {
      reject(new Error(error.errors[0].message));
    }
  });
}

async function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedRows = await Set.destroy({
        where: { set_num: set_num }
      });

      if (deletedRows === 0) {
        throw new Error('Set not found or not deleted');
      }
      resolve();
    } catch (error) {
      reject(new Error(error));
    }
  })
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet };