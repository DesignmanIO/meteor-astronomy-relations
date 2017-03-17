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
  const Class = AstroClass.get(localClassName);
  const doc = Class.findOne({[keyField]: key});

  if (!foreignClassName || !foreignKey) {
    throw new Meteor.Error(500, 'Class and docId are required');
  }
  // if (callback && typeof callback !== 'function') throw new Meteor.Error(500, 'Callback must be a function');

  const RelatedClass = AstroClass.get(foreignClassName);
  const relatedDoc = RelatedClass.findOne({[foreignKeyField]: foreignKey});
  doc.set(keyStore, uniq([...doc[keyStore], foreignKey]));
  doc.save();
  relatedDoc.set(foreignKeyStore, uniq([...relatedDoc[foreignKeyStore], key]));
  relatedDoc.save();
  console.log(`Linked ${localClassName} ${key} with ${foreignClassName} ${foreignKey}`);
  console.log(localClassName,
  foreignClassName,
  key,
  keyStore,
  keyField,
  foreignKey,
  foreignKeyStore,
  foreignKeyField);
  return 1;
};

export default relateTo;
