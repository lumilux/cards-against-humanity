(function(){

var output = PUBNUB.$('output');

var pubnub = PUBNUB.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37"
});

PUBNUB.subscribe({
    channel  : 'my_browser_channel',
    callback : function(message) {
        console.log('subscribed');
    }
});

$("#ping").click(function() {
	PUBNUB.publish({
		channel: 'my_browser_channel',
		message: 'ping. '
	});
});

$(document).ready(function() {
	console.log(window.location.pathname);
	var path = window.location.pathname;
	
	if(path == "/rooms") {
		console.log("in /rooms");
		Room = Ember.Object.extend({
			room_name: "default"
			id: 
			
			name: function(rm) {
				this.get('room_name');
			}
		});
		
		var rm = Room.create({
			name: "room A B",
			id: "1"
		});
		console.log(rm);
		
		
		
	} else if(path == "blah")
	{
		
	}
	
});

console.log('here here');
console.log($('#username'));

// replace single underscores in black cards with a fancy blank line
$(".card span").replaceText("_", "<span class='_'></span>");

})();