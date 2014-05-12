'use strict';

var albums = global.nss.db.collection('albums');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');

exports.index = (req, res)=>{
  res.render('home/index', {title: 'Home'});
};

exports.help = (req, res)=>{
  res.render('home/help', {title: 'Node.js: Help'});
};

exports.addNew = (req, res)=>{
  artists.find().toArray((e, artistCollection)=>{
    albums.find().toArray((er, albumCollection)=>{
      songs.find().toArray((err, songCollection)=>res.render('home/new', {title: 'Add New Content', artists: artistCollection, albums: albumCollection, songs: songCollection}));
    });
  });
};
