var collection = require("../collection/collection.js");
var Course = collection.course;

exports.allcourse = function() {
    return Course.find().fetch();
}

exports.mycourse = function(openid) {
    return Course.find({openid : openid}).fetch();
}
