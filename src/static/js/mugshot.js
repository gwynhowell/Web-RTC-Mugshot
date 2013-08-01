(function($) {
	var MSG_INTRO = 'To use this app you need to grant permission to use the webcam from the top right of the screen!';
	var MSG_NICE_SHOT = 'Nice Shot!<br />Click Save Photo to upload to the server!';
	var MSG_SAVED = 'Your mugshot has been saved!';
	var MSG_NOT_SUPPORTED = 'Your browser is not compatible with this app.<br />Try <a href="http://chrome.google.com" target="_BLANK">Chrome</a> or <a href="http://www.firefox.com" target="_BLANK">Firefox</a>';
	
	var ERR_PERMISSION_DENIED = 1;
	
	var streaming = false;
	var video = document.querySelector('#video');
	var canvas = document.querySelector('#canvas');
	var photo = document.querySelector('#photo');
	
	var btnCapture = document.querySelector('#btnCapture');
	var btnSave = document.querySelector('#btnSave');
	
	var width = 300;
	var height = 0;

	var constraints = {
		video: true,
		audio: false
	};
	
	function successCallback(stream) {
		if (navigator.mozGetUserMedia) {
			video.mozSrcObject = stream;
		} else {
			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL.createObjectURL(stream);
		}
		video.play();
	}
	
	function errorCallback(err) {
		if (err.code == ERR_PERMISSION_DENIED) {
			alert('You need to grant this app permission to use your webcam!');
		}
		console.log("An error occured! " + err);
	}
	
	video.addEventListener('canplay', function(ev) {
		if (!streaming) {
			height = video.videoHeight / (video.videoWidth/width);
			video.setAttribute('width', width);
			video.setAttribute('height', height);
			canvas.setAttribute('width', width);
			canvas.setAttribute('height', height);
			streaming = true;
		}
	}, false);
	
	function takePicture() {
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(video, 0, 0, width, height);
		var data = canvas.toDataURL('image/png');
		photo.setAttribute('src', data);
		
		$('#video').hide();
		$('#photo').show();

		$('#msg').html(MSG_NICE_SHOT);

		$('#btnCapture').hide();
		$('#btnRetake').show();
		$('#btnSave').show();
	}
	
	function savePicture() {
		if (!EMAIL) {
			if (confirm('You have to log in to save Mug Shots!\n\nLog in now?!'))
				location.href = LOGIN_URL;
			return;
		}
		
		var data = canvas.toDataURL('image/png');
		$.ajax({
			type: 'POST',
			url: '/save',
			data: { imgBase64: data }
		}).done(function(id) {
			console.log('saved with id ' + id);
			$('#mugshots').prepend($('<img />').attr('src', '/photo/'+id).attr('id', 'mugshot_'+id).data('id', id).data('email', EMAIL).addClass('mugshot').click(function() { deletePicture(id); }));
			
			$('#video').show();
			$('#photo').hide();
			
			$('#msg').html(MSG_SAVED);
			
			$('#btnRetake').hide();
			$('#btnSave').hide();
			$('#btnCapture').show();
		});
	}
	
	function deletePicture(id) {
		if (!EMAIL)
			return;
		
		var email = $('#mugshot_'+id).data('email');
		if (email != EMAIL) {
			alert('You can only delete your own Mug Shots!');
			return;
		}
		
		if (confirm('Delete this Mug Shot?!')) {
			$.ajax({
				type: 'DELETE',
				url: '/photo/' + id,
			}).done(function() {
				console.log('deleted with id ' + id);
				$('#mugshot_' + id).remove();
			});
		}
	}

	$('#btnCapture').click(function() {
		takePicture();
	});

	$('#btnSave').click(function() {
		savePicture();
	});

	$('#btnRetake').click(function() {
		$('#video').show();
		$('#photo').hide();

		$('#btnCapture').show();
		$('#btnRetake').hide();
		$('#btnSave').hide();
	});

	$('.mugshot').click(function() {
		var id = $(this).data('id');
		deletePicture(id);
	});

	function init() {
		navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (navigator.getMedia) {
			navigator.getMedia(constraints, successCallback, errorCallback);
			$('#msg').html(MSG_INTRO);
		} else {
			$('#msg').html(MSG_NOT_SUPPORTED).addClass('error');
			$('#btnCapture').hide();
			alert('Your browser is not compatible with this app.\n\nTry Chrome -> chrome.google.com');
		}
	}
	
	$(function() {
		init();
	});
	
})(jQuery);