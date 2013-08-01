
(function($) {

	var streaming = false;
	var video = document.querySelector('#video');
	var canvas = document.querySelector('#canvas');
	var photo = document.querySelector('#photo');
	
	var btnCapture = document.querySelector('#btnCapture');
	var btnSave = document.querySelector('#btnSave');
	
	var width = 300;
	var height = 0;

	navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

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
		var PERMISSION_DENIED = 1;
		if (err.code == PERMISSION_DENIED) {
			alert('You need to grant this app permission to use your webcam!');
		}
		console.log("An error occured! " + err);
	}
	
	video.addEventListener('canplay', function(ev) {
		console.log('now')
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

		$('#intro').hide();
		$('#niceShot').show();

		$('#btnCapture').hide();
		$('#btnRetake').show();
		$('#btnSave').show();
	}
	
	function savePicture() {
		var data = canvas.toDataURL('image/png');
		$.ajax({
			type: 'POST',
			url: '/save',
			data: { imgBase64: data }
		}).done(function(id) {
			console.log('saved with id ' + id);
			$('#mugshots').prepend($('<img />').attr('src', '/photo/'+id).attr('id', 'mugshot_'+id).addClass('mugshot').click(function() { deletePicture(id); }));
			
			$('#video').show();
			$('#photo').hide();
			
			$('#niceShot').hide();
			$('#saved').show();
			
			$('#btnRetake').hide();
			$('#btnSave').hide();
			$('#btnCapture').show();
		});
	}
	
	function deletePicture(id) {
		$.ajax({
			type: 'DELETE',
			url: '/photo/' + id,
		}).done(function() {
			console.log('deleted with id ' + id);
			$('#mugshot_' + id).remove();
		});
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

		$('#niceShot').hide();

		$('#btnCapture').show();
		$('#btnRetake').hide();
		$('#btnSave').hide();
	});

	$('.mugshot').click(function() {
		var id = $(this).data('id');
		deletePicture(id);
	});
	
	navigator.getMedia(constraints, successCallback, errorCallback);
	
})(jQuery);