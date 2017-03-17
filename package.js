Package.describe({
  name: 'buishi:astronomy-relations-behavior',
  version: '2.0.0',
  summary: 'Timestamp behavior for Meteor Astronomy v2',
  git: 'https://github.com/DesignmanIO/meteor-astronomy-relations.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');

  api.use([
    'ecmascript',
    'es5-shim',
    'jagi:astronomy@2.2.0'
  ], ['client', 'server']);

  api.mainModule('lib/main.js', ['client', 'server']);
});
