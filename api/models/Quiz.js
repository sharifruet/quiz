// models/Quiz.js (Updated)
class Quiz {
  static initialize(sequelize, DataTypes) {
    const model = sequelize.define('Quiz', {
      title: { type: DataTypes.STRING, allowNull: false },
      createdBy: { type: DataTypes.STRING, allowNull: false }
    });

    // Define associations
    model.associate = (models) => {
      model.hasMany(models.Question, { foreignKey: 'quizId' });
    };

    return model;
  }
}

module.exports = Quiz;