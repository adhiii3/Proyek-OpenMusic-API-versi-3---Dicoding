class CollaborationHandler {
    constructor(CollaborationsService, validator) {
        this._service = CollaborationsService;
        this._validator = validator;
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const {playlistId, userId} = request.payload;
        const {id: userIdCredential} = request.auth.credentials;
        await this._service.verifyAccessOwnerPlaylist(playlistId, userIdCredential);
        const result = await this._service.addCollaborationPlaylistUser({userId,playlistId});
        const response = h.response({
            status: 'success',
            message: 'add Collaboration Success',
            data: {
                collaborationId:result,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const {playlistId, userId}=request.payload
        const {id: userCredentialId} = request.auth.credentials;
        await this._service.verifyAccessOwnerPlaylist(playlistId, userCredentialId);
        await this._service.deleteCollaboration({playlistId, userId});
        const response = h.response({
            status: 'success',
            message: 'Collaboration berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = CollaborationHandler;
