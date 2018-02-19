$( document ).ready( function() {
	$( '.switch' ).click( function (event) {
		event.preventDefault();
		$(this).toggleClass("active");
	} )

	$('.deck').toggleClass('empty');
} );