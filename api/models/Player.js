class Player {
  static initialize(sequelize, DataTypes) {
    const model = sequelize.define('Player', {
      name: { type: DataTypes.STRING, allowNull: false },
      score: { type: DataTypes.INTEGER, defaultValue: 0 }
    });

    model.associate = (models) => {
      model.belongsTo(models.GameSession, { foreignKey: 'gameSessionId' });
    };

    return model;
  }
}

module.exports = Player;