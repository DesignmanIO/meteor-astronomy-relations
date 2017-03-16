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
    keyField: '_id',
    // Field name in local class that stores keys
    keyStore: 'ThoseThings',
    // Key to store from related class
    foreignKeyField: '_id',
    // What field to store this key in, in related class
    // make sure it's defined in related class
    foreignKeyStore: 'TheseThings',
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
        [behavior.options.keyStore]: {
          type: relationType,
          optional: true,
          default() {
            return behavior.options.type === 'many' ? [] : '';
          },
        },
      },
      helpers: {
        getRelated(className, foreignKey) {
          const RelatedClass = AstroClass.get(className);
          // get specified doc, if it's related
          if (foreignKey){
            return RelatedClass.findOne({
              $and: [
                {_id: foreignKey},
                {[behavior.options.foreignKeyStore]: {$in: [this._id]}},
              ],
            });
          }
          // get all related docs
          else {
            return RelatedClass.find({
              [behavior.options.foreignKeyStore]: {$in: [this._id]},
            });
          }
        },
        relateTo(foreignClassName, foreignKey, callback) {
          const {
            keyField,
            keyStore,
            foreignKeyField,
            foreignKeyStore,
          } = behavior.options;
          const key = this[keyField];
          const Class = this.constructor;
          const localClassName = Class.name;
          return callMeteorMethod(
            Class,
            '/Astronomy/relateTo',
            [{
              localClassName,
              foreignClassName,
              key,
              keyStore,
              keyField,
              foreignKey,
              foreignKeyStore,
              foreignKeyField,
            }],
            callback,
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
