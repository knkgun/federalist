const DOMAIN_TABLE = {
  id: { type: 'int', primaryKey: true, autoIncrement: true },
  siteId: {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'domain_site_id_fk',
      table: 'site',
      rules: {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
      },
      mapping: 'id',
    },
  },
  names: { type: 'string', notNull: true },
  branch: { type: 'string', notNull: true },
  origin: { type: 'string', notNull: true },
  path: { type: 'string', notNull: true },
  serviceName: { type: 'string', notNull: true },
  state: { type: 'string', notNull: true },
  createdAt: { type: 'date', notNull: true },
  updatedAt: { type: 'date', notNull: true },
};

exports.up = (db) => db.createTable('domain', DOMAIN_TABLE);

exports.down = (db) => db.dropTable('domain');