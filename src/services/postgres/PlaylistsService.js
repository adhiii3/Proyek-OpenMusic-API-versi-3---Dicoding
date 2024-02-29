const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDbPlaylistModel,mapDBPlaylist_Songs,mapDBActivities} = require('../../utils');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist tidak dapat ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
              FROM 
                playlists 
              LEFT JOIN 
                collaborations on collaborations.playlist_id = playlists.id 
              INNER JOIN 
                users on users.id = playlists.owner
              WHERE
                playlists.owner = $1 
              OR 
                playlists.id = $1 OR collaborations.user_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDbPlaylistModel);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak dapat dihapus');
    }
  }

  async verifyPlaylistOwnerDelete(id, owner) {
    const query = {
        text: 'SELECT id, owner FROM playlists WHERE id = $1',
        values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (result.rows[0].owner !== owner) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
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
        const queryUserCollabolator = {
          text: 'SELECT * FROM collaborations WHERE user_id = $1',
          values: [owner],
        };
        const resultUserCollabolator = await this._pool.query(queryUserCollabolator);
        if (!resultUserCollabolator.rows.length) {
          throw new AuthorizationError('Anda tidak bisa mengakses resource ini');
        }
        const query = {
          text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
          values: [id, owner],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
          throw new InvariantError('Proses Kolaborasi tidak dapat diteruskan');
        }
      }
  }

  async postSongInPlaylistById(songId,playlistId,userId) {
    const queryCheckSong = {
      text: 'SELECT id FROM song WHERE id = $1',
      values: [songId],
  };
    const result = await this._pool.query(queryCheckSong);
    if (!result.rows.length) {
      throw new NotFoundError('song tidak dapat ditemukan');
    }
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const res = await this._pool.query(query);
    if (!res.rows[0].id) {throw new InvariantError('song tidak dapat ditambahkan ke playlist');}
    const idActivitis = `activity-${nanoid(16)}`;
    const time = new Date();
    const action = 'add';
    const queryAddActivity = {
        text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
        values: [idActivitis, playlistId, songId, userId, action, time],
    };
    await this._pool.query(queryAddActivity);
  }

  async getPlaylistAndSongsById(playlistId){
      const queryJoinPlaylistUserByPlaylistId = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users on playlists.owner = users.id WHERE playlists.id = $1`,
        values: [playlistId],
    };
    const queryJoinSongAndPlaylistSongs = {
        text: `SELECT song.id, song.title, song.performer FROM playlist_songs JOIN song on playlist_songs.song_id = song.id WHERE playlist_id = $1`,
        values: [playlistId],
    };
    const playlistUser = await this._pool.query(queryJoinPlaylistUserByPlaylistId);
    const songPlaylist = await this._pool.query(queryJoinSongAndPlaylistSongs);
    return mapDBPlaylist_Songs(playlistUser.rows[0], songPlaylist.rows);
  }

  async deleteSongInPlaylist(songId,playlistId,userId) {
    const query = {
        text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING song_id',
        values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
        throw new NotFoundError('Song tidak berhasil dihapus');
    }
    const idActivity = `activity-${nanoid(16)}`;
    const time = new Date();
    const action = "delete"
    const queryDeleteActivity = {
        text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
        values: [idActivity, playlistId, songId, userId, action, time],
    };
    await this._pool.query(queryDeleteActivity);
  }

  async getActivity(playlistId) {
    const queryPlaylists = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN collaborations on collaborations.playlist_id = playlists.id
      INNER JOIN users on users.id = playlists.owner
      WHERE playlists.owner = $1 OR playlists.id = $1 OR collaborations.user_id = $1`,
      values: [playlistId],
  };
  const resultPlaylists = await this._pool.query(queryPlaylists);
    const query = {
        text: `SELECT users.username, song.title, playlist_song_activities.action, playlist_song_activities.time  
        FROM 
          playlist_song_activities 
        INNER JOIN 
          users ON users.id = playlist_song_activities.user_id
        INNER JOIN 
          song on song.id = playlist_song_activities.song_id
        WHERE 
          playlist_song_activities.playlist_id = $1
        ORDER BY 
          time asc`,
        values: [playlistId],
    };
    const resultActivities = await this._pool.query(query);
    return mapDBActivities(resultPlaylists.rows[0].id, resultActivities.rows);
}

}
module.exports = PlaylistService;
