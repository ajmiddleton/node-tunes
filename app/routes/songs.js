'use strict';

var multiparty = require('multiparty');
var songs = global.nss.db.collection('songs');
var albums = global.nss.db.collection('albums');
var fs = require('fs');
var Mongo = require('mongodb');
var rimraf = require('rimraf');
var _ = require('lodash');


exports.index = (req, res)=>{
  songs.find().toArray((e,r)=>{
    res.render('songs/index', {title: 'Songs', songs:r});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var song = {};
    song.name = fields.name[0];
    song.file = files.song[0].originalFilename;
    song.albumId = Mongo.ObjectID(fields.albumId[0]);
    songs.save(song, ()=>{
      fs.mkdirSync(`${__dirname}/../static/data/song/${song._id}`);
      fs.renameSync(files.song[0].path, `${__dirname}/../static/data/song/${song._id}/${files.song[0].originalFilename}`);
      res.redirect('/new');
    });
    albums.findOne({_id: Mongo.ObjectID(fields.albumId[0])}, (err, album)=>{
      album.songs.push(song._id);
      albums.save(album, ()=>{});
    });
  });
};

exports.destroy = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);

  songs.findOne({_id:_id}, (err, song)=>{
    albums.findOne({_id:song.albumId}, (er, album)=>{
      if(album !== null){
        console.log('-------BEFORE REJECT---------');
        console.log(album);
        album.songs = _.reject(album.songs, s=> s.toString() === song._id.toString());
        console.log('--------AFTER REJECT-------------');
        console.log(album);
        albums.save(album, ()=>{});
      }  
    });
  });
  songs.findAndRemove({_id:_id}, ()=>{
    rimraf.sync(`${__dirname}/../static/data/song/${req.params.id}`);
    res.redirect('/songs');
  });
};
