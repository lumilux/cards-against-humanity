(function(){

var output = PUBNUB.$('output');

var pubnub = PUBNUB.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37"
});

PUBNUB.subscribe({
    channel  : 'my_browser_channel',
    callback : function(message) {
        output.innerHTML = [
            message, '<br />', output.innerHTML
        ].join('');
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
		CAH.Room = Ember.Object.create({
			name: "room test name"			
		});
		
		var rm = CAH.Room.create();
		console.log(rm);
		
		
		
	} else if(path == )
	
});

console.log('here here');
console.log($('#username'));

})();