import './main.html';
var collection = require('../collection/collection.js');
var getinfoJS = require('../server/methods/getinfo.js');
var Message = collection.message;
var Chatter = collection.chatter;

Router.route('/', function() {
  this.render('Home');
});

Router.route('/chat', function () {

  var req = this.request;
  var res = this.response;
  var code = this.params.query.code;
  var openid = getinfoJS.getopenid(code);
  var name = getinfoJS.getname(openid);

  Template.Chat.helpers({
    name : name,
    messages: function() {
      return Message.find({}, { sort: { time: -1 } });
    }
  });
  this.render('Chat');
});

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

Template.Chat.events = {
  'keydown input#message': function(event) {
    if (event.which === 13) {
      sendMessage("test");
    }
  }
};