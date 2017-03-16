import { Module } from 'meteor/jagi:astronomy';
import {Meteor} from 'meteor/meteor';
const isRemote = Module.modules.storage.utils.isRemote;
const callMeteorMethod = Module.modules.storage.utils.callMeteorMethod;

const relateTo = (className, docId, callback) => {
  const doc = this;
  const Class = this.constructor;

  if (!className || !docId) {
    throw new Meteor.Error(500, 'Class and docId are required');
  }
  if (callback && typeof callback !== 'function') throw new Meteor.Error(500, 'Callback must be a function');

  const RelatedClass = AstroClass.get(className);
  const relatedDoc = RelatedClass.findOne(docId);

  doc.set({
    [behavior.options.keyField]:
      uniq([...doc[behavior.options.keyField], docId]),
  });
  doc.save((err, id) => {
    if (err && callback) callback(err, undefined);
    relatedDoc.set({
      [behavior.options.foreignKeyField]:
        uniq([...relatedDoc[behavior.options.foreignKeyField], doc._id]),
    });
    relatedDoc.save((err, id) => {
      if (callback) callback(err, id);
    })
  });
};

export default relateTo;
