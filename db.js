const {Sequelize} = require('sequelize') 

module.exports = new Sequelize(
    'user',
    'gen_user',
    'root_root92',
    {
        host: '92.51.38.28',
        port: '5432',
        dialect: 'postgres'
    }
)