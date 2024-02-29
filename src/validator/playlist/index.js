const {playlistPayloadSchema, songPlaylistSchema} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistValidator {
    validatePlaylistSongPayload = (payload) => {
        const validationResult = playlistPayloadSchema.validate(payload);

        if (validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }

        return validationResult.value;
    };

    validateSongPlaylist = (payload) => {
        const validationResult = songPlaylistSchema.validate(payload);

        if (validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }

        return validationResult.value;
    };
};

module.exports = {PlaylistValidator};
