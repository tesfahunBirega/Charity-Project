const { EntitySchema } = require('typeorm');
const { Base } = require('./BaseModel');

class User extends Base {
  // Define additional properties specific to Post entity
  constructor() {
    super(); // Call the constructor of the Base entity to inherit its properties
    this.fullName = { type: 'varchar' };
    this.phone = { type: 'varchar' };
    this.email = { type: 'varchar' };
    this.password = { type: 'varchar', nullable: true }; // Set nullable to true to indicate that password is not required
    this.role = { type: 'varchar', nullable: true };
    this.country = { type: 'varchar', nullable: true };
    this.resetToken = { type: 'varchar', nullable: true };
    this.volenteerTypeId = { type: 'varchar', nullable: true };
    this.image = { type: 'varchar', nullable: true };
  }
}

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: new User(),
  relations: {
    users: {
      target: 'User', // Target entity name
      type: 'one-to-many', // Type of relationship
      joinColumn: true, // Indicates if this side of the relationship will contain the join column(s)
      inverseSide: 'voluntery', // Name of the inverse side property (optional)
    },
  },
});
