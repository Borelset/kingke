var config = require("../config.js");
var collection = require("../../collection/collection.js");
var Friend = collection.friend;

exports.ensure_friend = function (mname, tname) {
    if(Friend.findOne({mname : mname, tname : tname}) != undefined)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

exports.add_friend = function (mname, tname) {
    var mt_rel = {};
    mt_rel.mname = mname;
    mt_rel.tname = tname;
    Friend.insert({mt_rel});
}