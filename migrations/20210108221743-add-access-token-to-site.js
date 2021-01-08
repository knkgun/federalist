const TABLE = 'site';
const COLUMN = 'accessToken';

exports.up = (db, callback) => db.addColumn(
  TABLE, COLUMN,
  { type: 'string', notNull: true, defaultValue: '-' },
  callback
);
  
exports.down = (db, callback) => db.removeColumn(TABLE, COLUMN, callback);