const mapDBToModel = ({
  id,
  name,
  year,
  songs,
}) => ({
  id,
  name,
  year,
  songs,
});

const mapDbSongModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDbSongByIdModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDbPlaylistModel = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username:username,
});

const mapDBPlaylist_Songs = (playlist, songs) => ({
  playlist: {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songs,
  },
});

const mapDBActivities = (playlistId, activities) => ({
  playlistId: playlistId,
  activities: activities,
});

const mapDBAlbumSongService = ({
  id, 
  name,
  year,
  cover_url, 
}, song ) => ({
  id, 
  name, 
  year,
  coverUrl:cover_url,
  songs: song
});

module.exports = {mapDBAlbumSongService ,mapDBToModel, mapDbSongModel, mapDbSongByIdModel, mapDbPlaylistModel,mapDBPlaylist_Songs, mapDBActivities };
