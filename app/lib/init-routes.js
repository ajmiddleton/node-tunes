'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var albums = traceur.require(__dirname + '/../routes/albums.js');
  var artists = traceur.require(__dirname + '/../routes/artists.js');
  var songs = traceur.require(__dirname + '/../routes/songs.js');

  app.get('/', dbg, home.index);
  app.get('/help', dbg, home.help);
  app.get('/new', dbg, home.addNew);
  app.get('/artists', dbg, artists.index);
  app.post('/artists', dbg, artists.create);
  app.delete('/artists/:id', dbg, artists.destroy);
  app.get('/artists/:id/show', dbg, artists.show);
  app.get('/albums', dbg, albums.index);
  app.post('/albums', dbg, albums.create);
  app.delete('/albums/:id', dbg, albums.destroy);
  app.get('/albums/:id/show', dbg, albums.show);
  app.get('/songs', dbg, songs.index);
  app.post('/songs', dbg, songs.create);
  app.delete('/songs/:id', dbg, songs.destroy);
  console.log('Routes Loaded');
  fn();
}
