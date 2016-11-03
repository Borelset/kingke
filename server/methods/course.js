var collection = require("../../collection/collection.js");
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

exports.create_course = function(cname, openid) {
    var course_info = {};
    course_info.name = cname;
    course_info.teacher = openid;
    Course.insert(course_info);
    return 0;
}

exports.add_course = function(popenid, cid) {
    var pc_rel = {};
    pc_rel.name = popenid;
    pc_rel.teacher = openid;
    Course.insert(pc_rel);
    return 0;
}