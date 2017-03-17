import {Class as AstroClass, Module, Behavior} from 'meteor/jagi:astronomy';
import {Meteor} from 'meteor/meteor';
const isRemote = Module.modules.storage.utils.isRemote;
const callMeteorMethod = Module.modules.storage.utils.callMeteorMethod;
import {uniq, find} from 'lodash';

const relateTo = ({
  localClassName,
  foreignClassName,
  key,
  foreignKey,
}) => {
  if (!foreignClassName || !foreignKey) {
    throw new Meteor.Error(500, 'Class and docId are required');
  }
  const Class = AstroClass.get(localClassName);
  const relationOptions = Class.getBehavior('relations').map((r) => r.options);
  const options = find(relationOptions, {foreignClass: foreignClassName});
  const {keyStore,keyField,foreignKeyStore,foreignKeyField} = options;
  const doc = Class.findOne({[keyField]: key});
  const RelatedClass = AstroClass.get(foreignClassName);
  const relatedDoc = RelatedClass.findOne({[foreignKeyField]: foreignKey});

  doc.set(keyStore, [...doc[keyStore], foreignKey]);
  doc.save();
  relatedDoc.set(foreignKeyStore, [...relatedDoc[foreignKeyStore], key]);
  relatedDoc.save();
  console.log(`Linked ${localClassName} ${key} with ${foreignClassName} ${foreignKey}`);
  return 1;
};

export default relateTo;
