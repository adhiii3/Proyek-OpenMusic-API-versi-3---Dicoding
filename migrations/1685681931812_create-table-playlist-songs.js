/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('playlist_songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            references: 'playlists',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
        song_id: {
            type: 'VARCHAR(50)',
            references: 'song',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_songs');
};
