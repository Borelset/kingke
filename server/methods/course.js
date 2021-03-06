var collection = require("../../collection/collection.js");
var Course = collection.course;
var Info = collection.info;
var Student = collection.student;

exports.allcourse = function() {
    return Course.find().fetch();
}

exports.mycourse = function(name) {
    return Student.find({sname : name}).fetch();
}


exports.create_course = function(cid, cname, tname, openid) {
    var course_info = {};
    course_info.cid = cid.toString();
    course_info.name = cname;
    course_info.teacher_name = tname;
    course_info.teacher_id = openid;
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

exports.search_course = function(cname) {
    return Course.findOne({name : cname});
}

exports.num_course = function() {
    return Course.find().count();
}