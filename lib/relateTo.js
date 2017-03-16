import {Class as AstroClass, Module} from 'meteor/jagi:astronomy';
import {Meteor} from 'meteor/meteor';
const isRemote = Module.modules.storage.utils.isRemote;
const callMeteorMethod = Module.modules.storage.utils.callMeteorMethod;
import {uniq} from 'lodash';

const relateTo = ({
  localClassName,
  foreignClassName,
  key,
  keyStore,
  keyField,
  foreignKey,
  foreignKeyStore,
  foreignKeyField,
}) => {
  if (Meteor.isServer()){
    const Class = AstroClass.get(localClassName);
    const doc = Class.findOne({[keyField]: key});

    if (!foreignClassName || !foreignKey) {
      throw new Meteor.Error(500, 'Class and docId are required');
    }
    // if (callback && typeof callback !== 'function') throw new Meteor.Error(500, 'Callback must be a function');

    const RelatedClass = AstroClass.get(foreignClassName);
    const relatedDoc = RelatedClass.findOne({[foreignKeyField]: foreignKey});
    console.log('doc keystore', doc, keyStore);
    doc.set(keyStore, uniq([...doc[keyStore], foreignKey]));
    // console.log(`docs key store: ${doc[keyStore]}`);
    doc.save((err, id) => {
      // if (err && callback) callback(err, undefined);
      console.log('Saved local doc')
      relatedDoc.set(foreignKeyStore, uniq([...relatedDoc[foreignKeyStore], key]));
      // console.log(`related doc's key store: ${relatedDoc[foreignKeyStore]}`);
      relatedDoc.save((err, id) => {
        // if (callback) callback(err, id);
        console.log('Saved related doc');
      })
    });
  }
};

export default relateTo;
