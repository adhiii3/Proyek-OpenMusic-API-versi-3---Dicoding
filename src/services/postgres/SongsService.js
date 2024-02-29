const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDbSongModel, mapDbSongByIdModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    id, title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'INSERT INTO song VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query;

    if (!title && !performer) {
      query = {
        text: 'SELECT id,title,performer FROM song',
      };
    }

    if (title) {
      query = {
        text: 'SELECT id,title,performer FROM song WHERE title ILIKE $1',
        values: [`%${title}%`],
      };
    }

    if (performer) {
      query = {
        text: 'SELECT id,title,performer FROM song WHERE performer ILIKE $1',
        values: [`%${performer}%`],
      };
    }

    if (title && performer) {
      query = {
        text: 'SELECT id,title,performer FROM song WHERE title ILIKE $1 AND performer ILIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
    }

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return result.rows.map(mapDbSongModel);
  }

  async getSongByAlbumId(id) {
    const query = {
      text: 'SELECT id,title,performer FROM song WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows.map(mapDbSongModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM song WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapDbSongByIdModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE song SET title = $1, year = $2, genre = $3, performer = $4, duration=$5, album_id= $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM song WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
