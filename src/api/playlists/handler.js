class PlaylistHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const {name} = request.payload;
        const {id: userId} = request.auth.credentials;
        const playlistId = await this._service.addPlaylist(name,userId);
        const response = h.response({
            status: 'success',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getplaylistHandler(request, h) {
        const {id: userId} = request.auth.credentials;
        const playlists = await this._service.getPlaylists(userId);
        const response = h.response({
            status: 'success',
            data: {
                playlists,
            },
        });
        return response;
    }

    async deletePlaylistByIdHandler(request, h) {
        const {id} = request.params;
        const {id: userId} = request.auth.credentials;
        await this._service.verifyPlaylistOwnerDelete(id,userId);
        await this._service.deletePlaylistById(id);
        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validateSongPlaylist(request.payload);
        const {songId} = request.payload;
        const {id:playlistId} = request.params;
        const {id: userId} = request.auth.credentials;
        await this._service.verifyAccessOwnerPlaylist(playlistId,userId);
        await this._service.postSongInPlaylistById(songId,playlistId,userId);
        const response = h.response({
            status: 'success',
            message: 'Song berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongHandler(request, h){
        const {id: userId} = request.auth.credentials;
        const {id: playlistId} = request.params;
        await this._service.verifyAccessOwnerPlaylist(playlistId,userId);
        const playlistAndSongsById = await this._service.getPlaylistAndSongsById(playlistId);
        const response = h.response({
            status: 'success',
            data: playlistAndSongsById,
        });
        response.code(200);
        return response;
    }

    async deleteSongInPlaylistHandler(request, h){
        this._validator.validateSongPlaylist(request.payload);
        const {songId:songId} = request.payload;
        const {id:userId} = request.auth.credentials;
        const {id:playlistId} = request.params;
        await this._service.verifyAccessOwnerPlaylist(playlistId, userId);
        await this._service.deleteSongInPlaylist(songId,playlistId,userId);
        const response = h.response({
            status: 'success',
            message: 'Song berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    async getPlaylistActivityHandler(request, h){
        const {id: userCredentialId} = request.auth.credentials;
        const {id:playlistId} = request.params;
        await this._service.verifyAccessOwnerPlaylist(playlistId, userCredentialId);

        const activities = await this._service.getActivity(playlistId);
        const response = h.response({
            status: 'success',
            data: activities,
        });
        response.code(200);
        return response;
    }
}
module.exports = PlaylistHandler;