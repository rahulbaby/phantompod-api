import mongoose from 'mongoose';
import config from 'config';
import q from 'q';
/**
 * The setup class for all the dependencies of the application
 */
class SetUp {
  /**
   * @constructor
   * @param {Object} config The config object
   */
  static initialize() {
    this.setupMongoose();
  }

  /**
   * This will setup mongodb
   */
  static setupMongoose() {
    mongoose.Promise = q.Promise;
    mongoose.connection.on('open', () => {
      console.log('Connected to mongo shell.');
      console.log('mongodb url ', config.get('db.url'));
    });
    mongoose.connection.on('error', (err) => {
      console.log('Could not connect to mongo server!');
      console.log(err);
    });
    return mongoose.connect(config.get('db.url'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}
export default SetUp;
