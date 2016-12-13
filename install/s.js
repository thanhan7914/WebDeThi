const Query = require('mongo-promise');
const utils = require('../utils');

new Query(utils.config.dbname)
.find({}, 'question')
.handle(console.log)
.close();
