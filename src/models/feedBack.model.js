const { EntitySchema } = require('typeorm');
const { Base } = require('./BaseModel');

class FeedBack extends Base {
  // Define additional properties specific to Post entity
  constructor() {
    super(); // Call the constructor of the Base entity to inherit its properties
    this.name = { type: 'varchar' };
    this.email = { type: 'varchar' };
    this.message = { type: 'varchar' };
    this.is_seen = { type: Boolean };
    this.role = { type: 'varchar' };
  }
}

module.exports = new EntitySchema({
  name: 'FeedBack',
  tableName: 'feedBacks',
  columns: new FeedBack(),

  relations: {},
});
