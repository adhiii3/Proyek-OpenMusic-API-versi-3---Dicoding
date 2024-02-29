const CollaborationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, {collaborationsService, validator}) => {
        const collaborationHandler = new CollaborationHandler(collaborationsService, validator);
        server.route(routes(collaborationHandler));
    },
};
