/*
 * Connect all of your endpoints together here.
 */
var tasks = require('./task.js');
var users = require('./user.js');

module.exports = function (app, router) {
    app.use('/api', require('./home.js')(router));
    app.use('/api/users', users);
    app.use('/api/tasks', tasks);
};