const { isDelimitedFQDN } = require('../utils/validators');

function associate({ Domain, Site }) {
  Domain.belongsTo(Site, {
    foreignKey: 'siteId',
  });
};

function define(sequelize, DataTypes) {
  const Domain = sequelize.define('Domain', {
    names: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isDelimitedFQDN,
      },
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM,
      values: ['dns_pending', 'dns_confirmed', 'provisioning', 'failed', 'created'],
      defaultValue: 'dns_pending',
      allowNull: false,
    },
  }, {
    tableName: 'domain',
  });

  Domain.associate = associate;
  Domain.prototype.isDnsPending = function() { return this.state === 'dns_pending'; };
  Domain.prototype.isDnsConfirmed = function () { return this.state === 'dns_confirmed'; };
  Domain.prototype.isProvisioning = function () { return this.state === 'provisioning'; };
  return Domain;
}

module.exports = define;