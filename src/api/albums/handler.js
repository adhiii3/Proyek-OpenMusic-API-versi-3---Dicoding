const autoBind = require('auto-bind');
const {mapDBAlbumSongService} = require('../../utils/index');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const result = mapDBAlbumSongService(album.album, album.songs);
    return {
      status: 'success',
      data: {
        album:result,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUserLikeAlbumByIdHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const {id: albumId} = request.params;
    await this._service.getAlbumById(albumId);
    await this._service.addUserAlbumLikeById(albumId, userId);
    const response = h.response({
        status: 'success',
        message: 'Operasi sukses dilakukan',
      });
      response.code(201);
      return response;
  }

  async deleteUserAlbumLikesByIdHandler(request, h){
    const {id: userId} = request.auth.credentials;
    const {id: albumId} = request.params;

    await this._service.getAlbumById(albumId);
    await this._service.deleteLike(albumId, userId);

    const response = h.response({
        status: 'success',
        message: 'Operasi sukses dilakukan',
      });
      return response;
  }

  async getUserAlbumLikeHandler(request, h){
    const {id} = request.params;
    const {res, inMemory} = await this._service.getUserAlbumLikeById(id);
    const likes = parseInt(res);
    if (inMemory){
      const response = h.response({
        status: 'success',
        message: 'Operasi sukses dilakukan',
        data: {
            likes: likes,
        },
      });
      response.header('X-Data-Source', inMemory);
      return response;    
    }
    const response = h.response({
      status: 'success',
      message: 'Operasi sukses dilakukan',
      data: {
          likes: likes,
      },
    });
      return response;
}

}
module.exports = AlbumsHandler;
