/* jshint unused:false */
'use strict';

var multiparty = require('multiparty');
var artists = global.nss.db.collection('artists');
var albums = global.nss.db.collection('albums');
var songs = global.nss.db.collection('songs');
var fs = require('fs');
var Mongo = require('mongodb');
var rimraf = require('rimraf');
var _ = require('lodash');


exports.index = (req, res)=>{

  artists.find().toArray((e,r)=>{
    res.render('artists/index', {title: 'Artists', artists:r});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var artist = {};
    artist.name = fields.name[0];
    artist.albums = [];
    artist.songs = [];
    artist.photo = files.photo[0].originalFilename;
    artists.save(artist, ()=>{
      fs.mkdirSync(`${__dirname}/../static/data/artist/${artist._id}`);
      fs.renameSync(files.photo[0].path, `${__dirname}/../static/data/artist/${artist._id}/${files.photo[0].originalFilename}`);
      res.redirect('/new');
    });
  });
};

exports.destroy = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.findAndRemove({_id:_id}, ()=>{
    rimraf.sync(`${__dirname}/../static/data/artist/${req.params.id}`);
    res.redirect('/artists');
  });
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.findOne({_id:_id}, (err, artist)=>{
    albums.find({_id: {$in: artist.albums} }).toArray((er, targetAlbums)=>{
      songs.find().toArray((e, songCollection)=>{
        targetAlbums = targetAlbums.map(al=>{
          if(al.songs.length > 0){
            al.songs = al.songs.map(s=>{
              var temp = _(songCollection).find(str=> str._id.toString() === s.toString());
              return temp;
            });
          }
          return al;
        });
        res.render('artists/show', {title: 'Artist', artist:artist, albums:targetAlbums});
      });
    });
  });
};
