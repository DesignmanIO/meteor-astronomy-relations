import { Class as AstroClass, Behavior, Module } from 'meteor/jagi:astronomy';
import {uniq, zipObject, each} from 'lodash';
import relateTo from './relateTo';
const hasMeteorMethod = Module.modules.storage.utils.hasMeteorMethod;
const callMeteorMethod = Module.modules.storage.utils.callMeteorMethod;

Behavior.create({
  name: 'relations',
  options: {
    // many or single
    type: 'many',
    // local key to store in foreign doc
    key: '_id',
    // Field name in local class that stores keys
    keyField: 'ThoseThings',
    // Key to store from related class
    foreignKey: '_id',
    // What field to store this key in, in related class
    // make sure it's defined in related class
    foreignKeyField: 'TheseThings',
    // What class to relate to
    foreignClass: 'Those',
  },
  createClassDefinition: function() {
    const behavior = this;
    let relationType;
    if (behavior.options.type === 'many') {
      relationType = [String];
    } else if (behavior.options.type === 'single') {
      relationType = String;
    } else {
      console.error('Unsupported relationship type, must be "single" or "many"');
    }
    return {
      fields: {
        [behavior.options.keyField]: {
          type: relationType,
          optional: true,
          default() {
            if (behavior.options.type === 'many') {
              return [];
            } else {
              return '';
            }
          }
        }
      },
      helpers: {
        getRelated(className, foreignDocKey) {
          const RelatedClass = AstroClass.get(className);
          // get specified doc, if it's related
          if (foreignDocKey){
            return RelatedClass.findOne({
              $and: [
                {_id: foreignDocKey},
                {[behavior.options.foreignKey]: {$in: [this._id]}},
              ],
            });
          }
          // get all related docs
          else {
            return RelatedClass.find({
              [behavior.options.foreignKey]: {$in: [this._id]},
            });
          }
        },
        relateTo(className, foreignDocKey, callback) {
          const Class = this.constructor;
          return callMeteorMethod(
            Class,
            '/Astronomy/relateTo',
            [className, foreignDocKey],
            callback
          );
        },
      },
    };
  },
  apply(Class) {
    const Collection = Class.getCollection();
    //
    // // If it's a remote collection then we register methods on the connection
    // // object of the collection.
    let connection = Collection._connection;
    if (connection) {
      // Prepare meteor methods to be added.
      let meteorMethods = {
        '/Astronomy/relateTo': relateTo,
    //     '/Astronomy/softRestore': meteorSoftRestore
      };
      each(meteorMethods, (meteorMethod, methodName) => {
        if (!hasMeteorMethod(connection, methodName)) {
          // Add meteor method.
          connection.methods(zipObject([methodName], [meteorMethod]));
        }
      });
    }
    Class.extend(
      this.createClassDefinition(), ['fields', 'events', 'helpers', 'methods']
    );
  }
});
