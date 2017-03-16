import { Class as AstroClass, Behavior } from 'meteor/jagi:astronomy';

Behavior.create({
  name: 'relations',
  options: {
    // many or single
    type: 'many',
    // Field name in local class that stores keys
    keyField: 'Documents',
    // Key to store from related class
    foreignKey: '_id',
    // What class to use
    foreignClass: 'Document',
  },
  createClassDefinition: function() {
    const behavior = this;
    let relationType;
    if (behavior.type === 'many') {
      relationType = [String];
    } else if (behavior.type === 'single') {
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
            if (behavior.type === 'many') {
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
        }
      },
      meteorMethods: {
        relateTo(className, docId) {
          const RelatedClass = AstroClass.get(className);
          const ThisClass = this.constructor;
          console.log(ThisClass.find(), RelatedClass.find());
        },
      },
    };
  },
  apply(Class) {
    // const Collection = Class.getCollection();
    //
    // // If it's a remote collection then we register methods on the connection
    // // object of the collection.
    // let connection = Collection._connection;
    // if (connection) {
    //   // Prepare meteor methods to be added.
    //   let meteorMethods = {
    //     '/Astronomy/softRemove': meteorSoftRemove,
    //     '/Astronomy/softRestore': meteorSoftRestore
    //   };
    //   each(meteorMethods, (meteorMethod, methodName) => {
    //     if (!hasMeteorMethod(connection, methodName)) {
    //       // Add meteor method.
    //       connection.methods(zipObject([methodName], [meteorMethod]));
    //     }
    //   });
    // }
    Class.extend(
      this.createClassDefinition(), ['fields', 'events', 'helpers', 'methods']
    );
  }
});
