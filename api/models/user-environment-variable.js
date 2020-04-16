const associate = ({ Site, UserEnvironmentVariable }) => {
  UserEnvironmentVariable.belongsTo(Site, {
    foreignKey: 'siteId”',
    allowNull: false,
  });
};

module.exports = (sequelize, DataTypes) => {
  const UserEnvironmentVariable = sequelize.define('UserEnvironmentVariable', {
    name: { type: DataTypes.STRING, allowNull: false },
    cipher: { type: DataTypes.STRING, allowNull: false },
    hint: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'user_environment_variable',
    timestamps: true,
    updatedAt: false,
    scopes: {
      forSiteUser: (user, Site, User) => ({
        include: [{
          model: Site,
          required: true,
          include: [{
            model: User,
            where: {
              id: user.id,
            },
          }],
        }],
      }),
    },
  });
  UserEnvironmentVariable.associate = associate;
  return UserEnvironmentVariable;
};
