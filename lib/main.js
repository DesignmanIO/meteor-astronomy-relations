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
  createClassDefinition() {
    const behavior = this;
    // console.log(behavior);
    // const field = set({}, behavior.options.keyStore, {
    //   type: behavior.options.type === 'many' ? [String] : String,
    //   optional: true,
    //   default() {
    //     return behavior.options.type === 'many' ? [] : '';
    //   },
    // })
    return {
      // fields: {
        // ...field,
        // [behavior.options.keyStore]: {
        //   type: behavior.options.type === 'many' ? [String] : String,
        //   optional: true,
        //   default() {
        //     return behavior.options.type === 'many' ? [] : '';
        //   },
        // }
      // },
      // events: {
      //   beforeSave(e) {
      //     const doc = e.target;
      //     const {keyStore} = behavior.options;
      //     e.stopPropagation();
      //     doc.set(keyStore, uniq(doc[keyStore]));
      //     console.log(e)
      //   },
      // },
      helpers: {
        getRelated(className, query, options) {
          const RelatedClass = AstroClass.get(className);
          console.log(this.constructor.getBehavior('relations'), this, behavior);
          // get specified doc, if it's related
          if (typeOf query = 'string') {
            return RelatedClass.find({
              $and: [
                {_id: query},
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
            foreignClass,
          } = behavior.options;
          const key = this[keyField];
          const Class = this.constructor;
          const localClassName = Class.className;
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
