class Question {
  static initialize(sequelize, DataTypes) {
    const model = sequelize.define('Question', {
      questionText: { type: DataTypes.STRING, allowNull: false },
      options: { type: DataTypes.JSON, allowNull: false },
      correctAnswer: { type: DataTypes.INTEGER, allowNull: false },
      timeLimit: { type: DataTypes.INTEGER, defaultValue: 10 }
    });

    model.associate = (models) => {
      model.belongsTo(models.Quiz, { foreignKey: 'quizId' });
    };

    return model;
  }
}

module.exports = Question;