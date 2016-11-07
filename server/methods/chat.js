var collection = require("../../collection/collection.js");
var Messages = collection.message;
var Chatter = collection.chatter;

sendMessage = function(fname) {
  var name = fname;
  var message = document.getElementById('message');
  if (message.value !== '') {
    Messages.insert({
      name: name,
      message: message.value,
      time: Date.now(),
    });
    document.getElementById('message').value = '';
    message.value = '';
  }
};
