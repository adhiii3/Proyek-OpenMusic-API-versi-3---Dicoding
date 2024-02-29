const InvariantError = require('../../exceptions/InvariantError');
const {CollaborationPayloadPostSchema} = require('./schema');

class CollaborationValidator {
    validateCollaborationPayload = (payload) => {
        const validationResult = CollaborationPayloadPostSchema.validate(payload); 

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
        return validationResult.value;
    };
};

module.exports = {CollaborationValidator};
