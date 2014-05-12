/* jshint unused:false */
'use strict';

var multiparty = require('multiparty');
var albums = global.nss.db.collection('albums');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var fs = require('fs');
var Mongo = require('mongodb');
var rimraf = require('rimraf');
var _ = require('lodash');

exports.index = (req, res)=>{
  albums.find().toArray((e,r)=>{
    res.render('albums/index', {title: 'Albums', albums:r});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var album = {};
    album.name = fields.name[0];
    album.artistId = Mongo.ObjectID(fields.artistId[0]);
    album.songs = [];
    album.photo = files.photo[0].originalFilename;

    albums.save(album, ()=>{
      fs.mkdirSync(`${__dirname}/../static/data/album/${album._id}`);
      fs.renameSync(files.photo[0].path, `${__dirname}/../static/data/album/${album._id}/${files.photo[0].originalFilename}`);
      res.redirect('/new');
    });
    artists.findOne({_id:album.artistId}, (err, artist)=>{
      artist.albums.push(album._id);
      artists.save(artist, ()=>{});
    });
  });
};

exports.destroy = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  albums.findAndRemove({_id:_id}, ()=>{
    rimraf.sync(`${__dirname}/../static/data/album/${req.params.id}`);
    res.redirect('/albums');
  });
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  albums.findOne({_id:_id}, (err, album)=>{
    songs.find().toArray((e, songCollection)=>{
        if(album.songs.length > 0){
          album.songs = album.songs.map(s=>{
            var temp = _(songCollection).find(str=> str._id.toString() === s.toString());
            return temp;
          });
        }
        res.render('albums/show', {title: 'Albums', album:album});
    });
  });
};
