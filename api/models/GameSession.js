class GameSession {
  static initialize(sequelize, DataTypes) {
    const model = sequelize.define('GameSession', {
      pin: { type: DataTypes.STRING, allowNull: false, unique: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    });

    model.associate = (models) => {
      model.belongsTo(models.Quiz, { foreignKey: 'quizId' });
      model.hasMany(models.Player, { foreignKey: 'gameSessionId' });
    };

    return model;
  }
}

module.exports = GameSession;