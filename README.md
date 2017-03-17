##Installation
```sh
$ meteor add buishi:astronomy-relations-behavior
```

##Useage
Note that the `getRelated` and `relateTo` functions are only applied to the class the relation is defined in, so if you want to be able to use it from both sides, add it to both classes (in the below example, you would also add a relation behavior to the Post class).
```javascript
// in class setup
const User = Class.create({
  name: 'User',
  collection: Meteor.users,
  fields: {
    ...
    Posts: {
      type: [String],
      default: () => [],
    }
  },
  behaviors: {
    // doesn't have to be array, use array for more than one relation
    relations: [
      options: {
        // many or single, currently single does nothing, so this can be omitted
        type: 'many',
        // local key to store in foreign doc
        // make sure it's unique or let it default to _id
        keyField: '_id',
        // Field name in this class that stores keys
        keyStore: 'Posts',
        // Key to store from related class
        foreignKeyField: '_id',
        // What field to store this key in, in related class
        // make sure it's defined in related class
        foreignKeyStore: 'Author',
        // What class to relate to
        foreignClass: 'Post',
      }
    ]
  }
});

// somewhere in your app logic
const author = User.findOne();
const post = new Post();
const postId = post.save();
author.relateTo('Post', postId);

// somewhere on an author profile page or something
// works like a find query
// probably doesn't work yet
author.getRelated('Post', {category: 'Cool things'}, {sort: {date: -1}});
```
