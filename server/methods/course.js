var collection = require("../collection/collection.js");
var Course = collection.course;
var Info = collection.info;

exports.allcourse = function() {
    return Course.find().fetch();
}

exports.mycourse = function(openid) {
    return Course.find({openid : openid}).fetch();
}

exports.course_include = function(cid)  {
    return Course.find({_id : cid}).fetch();
}