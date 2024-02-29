const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  // user like album
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postUserLikeAlbumByIdHandler(request, h),
    options: {
        auth: 'openmusicapp_jwt',
    },
},
{
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.deleteUserAlbumLikesByIdHandler(request, h),
    options: {
        auth: 'openmusicapp_jwt',
    },
},
{
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getUserAlbumLikeHandler(request, h),
  },
];

module.exports = routes;
