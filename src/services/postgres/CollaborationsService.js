const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addCollaborationPlaylistUser({playlistId, userId}) {

        const queryUser = {
            text: 'SELECT id FROM users WHERE id = $1',
            values: [userId],
        };

        const resultUser = await this._pool.query(queryUser);

        if (!resultUser.rowCount) {
            throw new NotFoundError('User tidak ditemukan');
        }

        const id = `collaboration-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Collaboration tidak dapat ditambahkan');
        }

        return result.rows[0].id;
    }

    async deleteCollaboration({playlistId, userId}) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyAccessOwnerPlaylist(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
          throw new NotFoundError('Playlist yang anda cari tidak ditemukan');
        }
        if (result.rows[0].owner !== owner) {
            throw new AuthorizationError('Anda tidak bisa mengakses resource ini');
        }
    }
}

module.exports = CollaborationsService;
