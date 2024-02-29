const Joi = require('joi');

const CollaborationPayloadPostSchema = Joi.object({
    playlistId: Joi.string().required(),
    userId: Joi.string().required(),
});

module.exports = {CollaborationPayloadPostSchema};
