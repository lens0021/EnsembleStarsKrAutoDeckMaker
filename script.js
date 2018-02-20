const abilityFromNumber = [ 'dance', 'vocal', 'performance' ];
const typeFromNumber = abilityFromNumber;
const typeToNumber = { dance: 0, vocal: 1, performance: 2 };
const maxCardNumber = 200;

const idols = [
	'테토라', '하지메', '토모야', '히나타', '미도리',
	'토리', '시노부', '유우타', '미츠루', '츠카사',
	'스바루', '호쿠토', '마코토', '소마', '아도니스',
	'코가', '리츠', '마오', '유즈루', '아라시',
	'케이토', '에이치', '카오루', '이즈미', '치아키',
	'쿠로', '와타루', '카나타', '레이', '나즈나'
];

const minCardNum = 5;

var data = undefined;

var newData = function() {
	var data = new Uint32Array(1+4*maxCardNumber);
	data[1] = 5;
	for ( var i=2; i < data.length; i+=4 )
		data[i] = ~0;
	return data;
}

var getData = function( request ) {
	if ( request === 'version' )
		return data[0] >>> 24;
	else if ( request === 'type' )
		return typeFromNumber[(data[0] >>> 20) & 15];
	else if ( request === 'activeUnitNum' )
		return ((data[0] >>> 16 ) & 15)+1;
	else if ( request === 'cardNum' ) {
		return data[1];
	}
	else {
		if ( data[2+request*4]==~0 )
			return undefined;
		return {
			idol: idols[data[2+request*4]],
			dance: data[2+request*4+1],
			vocal: data[2+request*4+2],
			performance: data[2+request*4+3]
		};
	}
}

var setData = function( type, val ) {
	if ( type === 'version' )
		data[0] = (data[0] & ~(255<<24)) + (val<<24);
	else if ( type === 'type' )
		data[0] = (data[0] & ~(15<<20)) + (typeToNumber[val]<<20);
	else if (type === 'activeUnitNum' )
		data[0] = (data[0] & ~(15<<16)) + ((val-1)<<16);
	else if( typeof(type) == 'number' ){
		if ( val['idol'] != undefined )
			data[2+(type*4)] = val['idol'];
		if ( val['dance'] != undefined )
			data[2+(type*4)+1] = val['dance'];
		if ( val['vocal'] != undefined )
			data[2+(type*4)+2] = val['vocal'];
		if ( val['performance'] != undefined )
			data[2+(type*4)+3] = val['performance'];
	} else {
		addCardData( val );
	}

	onChangedData();
}

var getHexStringData = function() {
	var str = '';
	for ( var i=0; i < 2+data[1]*4; i++ ) {
		str += data[i].toString(16);
	}

	return str;
}

var convertHexStringToData = function( str ) {
	var data = new Uint32Array(1+4*maxCardNumber);
	var j=0;
	for( var i=0; i+8< str.length; i++ ) {
		data[j] = parseInt( str.substring(i, i+8), 16 );
		j++;
	}

	return data;
}

var removeCardDataAt = function( i ) {
	data[1]--;
	for ( var mid = 2+i*4; mid < 2+data[1]*4; mid++ ) {
		data[mid] = data[mid+4];
	}
	data[mid] = ~0;
	onChangedData();
}

var addCardData = function( card ) {
	data[1]++;
	if ( card === undefined ) {
		data[2 + data[1]*4] = ~0;
	} else {
		data[2 + data[1]*4] = card['idol'];
		data[2 + data[1]*4+1] = card['dance'];
		data[2 + data[1]*4+2] = card['vocal'];
		data[2 + data[1]*4+3] = card['performance'];
	}
	onChangedData();
}

var $cardProto;

var addCard = function() {
	addCardData();
}

var pickerIndex = undefined;
var openIdolPicker = function( index ) {
	pickerIndex = index;
	$('.overlay').toggle( true );
};

var initializeCard = function( $card ) {
	var index = $card.prevAll().length;

	$card.find('.remove-card').click( function( event ) {
		event.preventDefault();
		if ( getData('cardNum') <= 5 )
			return;

		removeCardDataAt( index );
	} );

	$card.find('.card-thumb').click( function( event ) {
		event.preventDefault();

		openIdolPicker( index );
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
			 	addCard();
			 	$("input[type='number']").eq(index).focus().select();
			 }
		 }
	 });
	var cnt=0;
	$card.find("input[type='number']").on( 'input', function(e) {
		var type = abilityFromNumber[$(this).prevAll().length];
		setData(index, { type: $(this).val() } );
	});
};

var onChangedData = function () {
	// 계산
	console.log('cookie');
	var hexData = getHexStringData();
	var d = new Date();
	var exdays = 30;
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	document.cookie = "data="+hexData+';expires=' + d.toUTCString() + ';';
	console.log(document.cookie);
	// 디자인 변경
	// 속성
	$('.deck')
		.removeClass( 'dance' )
		.removeClass( 'vocal' )
		.removeClass( 'performance' )
		.addClass( getData('type') );
	// 유닛
	$('#unit2-switch').toggleClass( "active", getData('activeUnitNum') >= 2 );
	$('#unit3-switch').toggleClass( "active", getData('activeUnitNum') >= 3 );

	while ( getData('cardNum') < $('.input .card').length ) {
		$('.input .card:last').remove();
	}
	while ( getData('cardNum') > $('.input .card').length ) {
		var clone = $cardProto.clone().insertBefore( $('.add-card') );
		initializeCard( clone );
	}

	$('.input .card').each( function( i ) {
		$(this).find('.card-thumb').html( getData(i)['idol']);
		$(this).find('.card-dance').attr('value', getData(i)['dance'])
		$(this).find('.card-vocal').attr('value', getData(i)['vocal'])
		$(this).find('.card-performance').attr('value', getData(i)['performance'])
	} );

	$('.input .card .remove-card').toggleClass( "disabled", getData('cardNum') <= minCardNum );
};

$( document ).ready( function() {
	$cardProto = $('.input .card').clone();

	var cookie = document.cookie;
	dataStr = cookie.match(/data=([;]+)/);
	if ( dataStr != null )
		data = convertHexStringToData( dataStr[1] );
	else
		data = newData();
	onChangedData();

	for ( var i in idols ) {
		var $idol = $('<li></li>').addClass( 'idol-picker-idol' ),
		$anchor = $('<a></a>').attr( 'href','#' ).click( function( e ) {
			var index = $(this).parent().prevAll().length;
			event.preventDefault();
			setData( pickerIndex, {idol: index} );
			$('.overlay').toggle( false );
		} ).html(idols[i]);
		$idol.append( $anchor );
		$idol.appendTo($('.idolPicker ol'));
	}

	initializeCard($('.input .card'));

	$('.switch').click( function(event) {
		event.preventDefault();
		index = $(this).parent().parent().prevAll().length;

		setData( 'activeUnitNum', index + ($(this).hasClass('active')?0:1) );
	} );

	$('#deck-option-dance a').click( function(event) {
		event.preventDefault();
		setData( 'type', 'dance' );
	} );

	$('#deck-option-vocal a').click( function(event) {
		event.preventDefault();
		setData( 'type', 'vocal' );
	} );

	$('#deck-option-performance a').click( function(event) {
		event.preventDefault();
		setData( 'type', 'performance' );
	} );

	$('.deck-total-ability a').click( function( event ) {
		event.preventDefault();
		var crtType = getData( 'type' );
		if ( crtType == 'performance' )
			setData( 'type', 'dance' );
		if ( crtType == 'dance' )
			setData( 'type', 'vocal' );
		else
			setData( 'type', 'performance' );
	});

	$('.add-card a').click( function(event) {
		event.preventDefault();
		addCard();
	});

	$('.overlay').click( function(event) {
		// $(this).toggle( false );
	});

	$('.deck').toggleClass('loading');
} );