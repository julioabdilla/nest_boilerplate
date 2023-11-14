import { Instance, BaseModel as Model, DataTypes } from 'src/libs/db';

export class User extends Model {

  declare id: number;
  declare key: string;
  declare password: string;
  declare privateKey: string;
  declare publicKey: string;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    fullName: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'users',
    sequelize: Instance,
    timestamps: true,
    paranoid: true,
    underscored: true
  },
);