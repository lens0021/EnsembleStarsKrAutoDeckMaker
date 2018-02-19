$( document ).ready( function() {
	var data = {
		type: undefined,
		activeUnitNum: 1,
		cards: [
			{ idol: undefined, dance: 0, vocal: 0, performance: 0 },
			{ idol: undefined, dance: 0, vocal: 0, performance: 0 },
			{ idol: undefined, dance: 0, vocal: 0, performance: 0 },
			{ idol: undefined, dance: 0, vocal: 0, performance: 0 },
			{ idol: undefined, dance: 0, vocal: 0, performance: 0 }
		]
	};
	const abilityFromNumber = [ 'dance', 'vocal', 'performance' ];

	$('.switch').click( function(event) {
		event.preventDefault();
		switch ( $(this).parent().parent().prevAll().length ) {
			case 1:
				if ( data['activeUnitNum'] >= 2 )
					data['activeUnitNum'] = 1;
				else
					data['activeUnitNum'] = 2;
				break;
			case 2:
				if ( data['activeUnitNum'] == 3 )
					data['activeUnitNum'] = 2;
				else
					data['activeUnitNum'] = 3;
		}
		onChangedData();
	} );

	$('#deck-option-dance a').click( function(event) {
		event.preventDefault();
		data['type'] = 'dance';
		onChangedData();
	} );

	$('#deck-option-vocal a').click( function(event) {
		event.preventDefault();
		data['type'] = 'vocal';
		onChangedData();
	} );

	$('#deck-option-performance a').click( function(event) {
		event.preventDefault();
		data['type'] = 'performance';
		onChangedData();
	} );

	$('.deck-total-ability a').click( function( event ) {
		event.preventDefault();
		if ( data['type'] == 'performance' )
			 data['type'] = 'dance';
		if ( data['type'] == 'dance' )
			 data['type'] = 'vocal';
		else
			 data['type'] = 'dance';
		onChangedData();
	});

	var initializeCard = function( $card ) {
		var index = $card.prevAll().length;

		$card.find('.remove-card').click( function( event ) {
			event.preventDefault();
			if ( data['cards'].length <= 5 )
				return;

			data['cards'].splice( index, 1 );
			onChangedData();
		} );

		$card.find("input[type='number']").on( "click", function(e) {
		   $(this).select();
		});

		$card.find("input[type='number']").keydown(function (e) {
			if (e.which === 13) {
				 var index = $("input[type='number']").index(this) + 1;
				 if ( index <= $("input[type='number']").length - 1 )
				 	$("input[type='number']").eq(index).focus().select();
				 else {
				 	data['cards'].push( { idol: undefined, dance: 0, vocal: 0, performance: 0 } );
				 	onChangedData();
				 	$("input[type='number']").eq(index).focus().select();
				 }
			 }
		 });
		var cnt=0;
		$card.find("input[type='number']").on( 'input', function(e) {
			var type = abilityFromNumber[$(this).prevAll().length];
			data['cards'][index][type] = $(this).val();
			onChangedData();
		});
	};
	
	var $cardProto = $('.input .card').clone();

	var onChangedData = function () {
		// 계산

		// 디자인 변경
		// 속성
		$('.deck')
			.removeClass('dance')
			.removeClass('vocal')
			.removeClass('performance')
			.addClass(data['type']);
		// 유닛
		$('#unit2-switch').toggleClass( "active", data['activeUnitNum'] >= 2 );
		$('#unit3-switch').toggleClass( "active", data['activeUnitNum'] >= 3 );

		while ( data['cards'].length < $('.input .card').length ) {
			$('.input .card:last').remove();
		}
		while ( data['cards'].length > $('.input .card').length ) {
			var clone = $cardProto.clone().insertBefore( $('.add-card') );
			initializeCard( clone );
		}

		$('.input .card').each( function( i ) {
			$(this).find('.card-dance').attr('value', data['cards'][$(this).prevAll().length]['dance'])
			$(this).find('.card-vocal').attr('value', data['cards'][$(this).prevAll().length]['vocal'])
			$(this).find('.card-performance').attr('value', data['cards'][$(this).prevAll().length]['performance'])
		} );
	};

	$('.add-card a').click( function(event) {
		event.preventDefault();
		data['cards'].push( { idol: undefined, dance: 0, vocal: 0, performance: 0 } );
		onChangedData();
	})

	initializeCard($('.input .card'));
	onChangedData();

	$('.deck').toggleClass('empty');
} );