const Query = require('mongo-promise');
const utils = require('../utils');
const user = require('./sample/user.json');

user.password = utils.createHash(user.password);

let db = new Query('Academy');
db.insert(user, 'user')
.close();
