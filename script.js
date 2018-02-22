function log( msg ) {
	var showLog = true;
	if ( showLog ) console.log( msg );
}

// 상수들
const maxCardNum = 200;
const minCardNum = 5*3;

const idolNames = [
	'테토라', '하지메', '토모야', '히나타', '미도리',
	'토리', '시노부', '유우타', '미츠루', '츠카사',
	'스바루', '호쿠토', '마코토', '소마', '아도니스',
	'코가', '리츠', '마오', '유즈루', '아라시',
	'케이토', '에이치', '카오루', '이즈미', '치아키',
	'쿠로', '와타루', '카나타', '레이', '나즈나'
];

const idolNumbers = {};
for ( i in idolNames )
	idolNumbers[idolNames[i]] = i;

const abilityNameFromNumber = [ 'dance', 'vocal', 'performance' ];
const typeOfDeckFromNumber = abilityNameFromNumber;
const typeOfCardFromNumber = typeOfDeckFromNumber;
const NumberFromDeckType = { dance: 0, vocal: 1, performance: 2 };
const NumberFromCardType = NumberFromDeckType;

var makerData = undefined;

function numberToHexString( num, bit ) {
	var digits = bit / 4;

	var zeros = '';
	switch ( digits ) {
		case 4: zeros = '0000'; break;
		case 8: zeros = '00000000'; break;
		case 12: zeros = '000000000000'; break;
		case 16: zeros = '0000000000000000'; break;
		case 20: zeros = '00000000000000000000'; break;
		default: 
			for ( var ct = 0; ct < digits ; ct++ ) zeros += '0';
	}

	return ( zeros+(num.toString(16)) ).substr( -digits, digits );
}

function numberFromHexStringAt( str, start, length ) {
	return parseInt( str.substring( start, start+length ), 16 );
}

function DeckMakerData( code ) {
	var emptyCardCode = numberToHexString( 0xff, 4*2 )
		+numberToHexString( 0, 4*5*3 );

	function stringIndexOfNthCard( n ) {
		return 6+(n*(2+5*3));
	}

	this.getVersion = function() {
		return numberFromHexStringAt( this.code, 0, 2 );
	};
	this.getTypeOfDeck = function() {
		return typeOfDeckFromNumber[numberFromHexStringAt( this.code, 2, 1 )];
	};
	this.getActiveUnitNum = function() {
		return numberFromHexStringAt( this.code, 3, 1 );
	};
	this.getCardNum = function() {
		return numberFromHexStringAt( this.code, 4, 2 );
	};
	this.getCard = function( i ) {
		var cardNum = this.getCardNum();

		if ( i > cardNum - 1 ) return undefined;

		var firstCharIndex = stringIndexOfNthCard( i );
		var idolCode = numberFromHexStringAt( this.code, firstCharIndex, 2 );
		return card = {
			idol: idolCode != 0xff ? idolCode : null,
			dance: numberFromHexStringAt( this.code, firstCharIndex+2, 5 ),
			vocal: numberFromHexStringAt( this.code, firstCharIndex+2+5, 5 ),
			performance: numberFromHexStringAt( this.code, firstCharIndex+2+5*2, 5 ),
		}
	};

	this.getCode = function() {
		return this.code;
	}

	this.setVersion = function( version ) {
		this.code = numberToHexString( version, 4*2 )
			+this.code.substring( 2 );
		this.onChangedData();
	};
	this.setTypeOfDeck = function( type ) {
		this.code = this.code.substring( 0, 2 )
			+numberToHexString( NumberFromDeckType[type], 4 )
			+this.code.substring( 3 );
		this.onChangedData();
	};
	this.setActiveUnitNum = function( num ) {
		this.code = this.code.substring( 0, 3 )
			+numberToHexString( num, 4 )
			+this.code.substring( 4 );
		this.onChangedData();
	};
	this.setCardNum = function( num ) {
		this.code = this.code.substring( 0, 4 )
			+numberToHexString( num, 4*2 )
			+this.code.substring( 6 );
		this.onChangedData();
	};
	this.addCard = function( card ) {
		if ( card == undefined )
			this.code += emptyCardCode;
		else {
			this.code += numberToHexString( card['idol'] != null ? card['idol'] : 0xff, 4*2 )
			+numberToHexString( card['dance'], 4*5 )
			+numberToHexString( card['vocal'], 4*5 )
			+numberToHexString( card['performance'], 4*5 );
		}
		this.setCardNum( this.getCardNum() + 1 );
		this.onChangedData();
	};
	this.setCardAt = function( i, card ) {
		var firstCharIndex = stringIndexOfNthCard( i );
		var cardCode = '';
		if ( card == null )
			cardCode = emptyCardCode;
		else {
			cardCode = numberToHexString( card['idol'] != null ? card['idol'] : 0xff, 4*2 )
			+numberToHexString( card['dance'], 4*5 )
			+numberToHexString( card['vocal'], 4*5 )
			+numberToHexString( card['performance'], 4*5 );
		}
		log(cardCode);
		this.code = this.code.substring(0, firstCharIndex)
			+cardCode
			+this.code.substring( stringIndexOfNthCard ( i+1 ) );
		this.onChangedData();
	};
	this.removeCardAt = function( i ) {
		this.code = this.code.substring( 0, stringIndexOfNthCard( i ) )
			+this.code.substring( stringIndexOfNthCard ( i+1 ) );

		this.setCardNum( this.getCardNum() - 1 );
		this.onChangedData();
	};
	this.onChangedData = function() {
		// todo
	};

	if ( code != null && code != '' ) {
		this.code = code;
		return;
	}
	this.code = '000000';
	this.setVersion( 0 );
	this.setTypeOfDeck( 'dance' );
	this.setActiveUnitNum( 1 );

	for ( var i=0; i < minCardNum; i++ )
		this.addCard();
}

function writeCookie() {
	var code = makerData.getCode();
	var d = new Date();
	var exdays = 30;
	d.setTime( d.getTime() + (exdays*24*60*60*1000) );

	var cookie = 'deckMakerData='+code+';expires=' + d.toUTCString() + ';';

	log( '다음과 같은 쿠키를 씁니다: '+cookie );
	document.cookie = cookie;
	log( '쿠키가 다음과 같이 쓰였습니다: '+document.cookie );
}

var $cardProto;

var pickerIndex = undefined;
function openIdolPicker( index ) {
	pickerIndex = index;
	$('.overlay').toggle( true );
};

function initializeCard( $card ) {
	var index = $card.prevAll().length;
	// log(index+'번 카드를 초기화합니다.');

	$card.find('.remove-card').click( function( event ) {
		event.preventDefault();
		if ( makerData.getCardNum() <= minCardNum )
			return;

		log(index+'번 카드를 없앱니다.');
		makerData.removeCardAt( index );
		refreshPanels();
	} );

	$card.find('.card-thumb').click( function( event ) {
		event.preventDefault();

		log(index+'를 위한 picker를 띄웁니다.');
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
				makerData.addCard();
				$("input[type='number']").eq(index).focus().select();
			}
			refreshPanels();
		 }
	 });

	$card.find("input[type='number']").on( 'input', function(e) {
		var type = abilityNameFromNumber[$(this).prevAll().length];
		var card = makerData.getCard( index );
		card[type] = parseInt( $(this).val(), 10 );
		makerData.setCardAt( index, card );
		refreshPanels();
	});
};

function unitIncludesIdol(arr, idol) {
	for ( var i in arr ) {
		if ( arr[i][0] == idol ) return true;
	}
	return false;
}

function makeBestDeck( size ) {
	var deck = [ [/* [ 5, 134 ], [3, 155 ] */], [], [] ];
	var type = makerData.getTypeOfDeck();
	var cardList = [];
	for ( var i = 0; i < makerData.getCardNum(); i++ ) {
		var card = makerData.getCard( i );
		cardList.push( [ card['idol'], card[type] ] );
	}
	cardList.sort( function(a, b) { return b[1] - a[1]; } );

	notFullUnit = 0;
	for ( var i in cardList ) {
		if ( deck[notFullUnit].length == 5 ) {
			if ( ++notFullUnit == size )
				break;
		}
		var unit = notFullUnit;
		while ( unit != size && ( deck[unit].length == 5 || unitIncludesIdol( deck[unit], cardList[i][0]) ) ) 
			unit++;

		if ( unit != size )
			deck[unit].push( cardList[i] );
	}

	return deck;
}
var deck;
function refreshPanels() {
	writeCookie();
	log('패널을 새로고침합니다.');

	var deckTotalAbility = 0;
	var unitTotalAbility = [ 0, 0, 0 ];
	var unitSkillNum = [ 0, 0, 0 ];
	
	deck = makeBestDeck( makerData.getActiveUnitNum() );

	// 총합 계산
	for ( var i = 0; i < deck.length; i++ ) {
		for ( var j = 0; j < deck[i].length; j++ )
			unitTotalAbility[i] += deck[i][j][1];
	}

	if ( makerData.getActiveUnitNum() == 1 ) {
		deckTotalAbility = 
			unitTotalAbility[0];
	} else if ( makerData.getActiveUnitNum() == 2 ) {
		deckTotalAbility = 
			Math.ceil( unitTotalAbility[0] *1.5, 0 )
			+ Math.ceil( unitTotalAbility[1] *1.5, 0 )
			+ Math.ceil( unitTotalAbility[2] *1.5, 0 );
	}
	else if ( makerData.getActiveUnitNum() == 3 ) {
		deckTotalAbility = 
			unitTotalAbility[0]*2
			+ unitTotalAbility[1]*2
			+ unitTotalAbility[2]*2;
	}

	// 계산 결과 표시
	$('#deck-total-ability').html(deckTotalAbility);
	var $unitTotals = $('.unit-total-ability').each( function( i ) {
		$(this).html( unitTotalAbility[i] );
	});

	var $unitSkillNum = $('.unit-skill-number').each( function( i ) {
		$(this).html( unitSkillNum[i] );
	});

	$('.deck .card').each( function( i ) {
		if ( deck[i] == undefined ) {
			$(this).find('.name').html('');
			$(this).find('.ability').html('0');
		} else {
			$(this).find('.name').html( deck[i][0] != null ? idolNames[deck[i][0]] : deck[i][0] );
			$(this).find('.ability').html( deck[i][1] );
		}
	} );

	$('.deck .unit').each( function( i ) {
		if ( deck[i] == null || deck[i].length == 0 ) {
			$(this).find('.card .name').html('');
			$(this).find('.card .ability').html('0');
		} else {
			$(this).find('.card').each( function( j ) {
				if ( deck[i][j] != null ) {
					$(this).find('.name').html( idolNames[deck[i][j][0]] );
					$(this).find('.ability').html( deck[i][j][1] );
				} else {
					$(this).find('.card .name').html('');
					$(this).find('.card .ability').html('0');
				}
			} );
		}
	} );
	
	// 디자인 변경
	// 속성
	$('.deck')
		.removeClass( 'dance' )
		.removeClass( 'vocal' )
		.removeClass( 'performance' )
		.addClass( makerData.getTypeOfDeck() );
	// 유닛
	$('.unit').each( function( i ) {
		$(this).toggleClass( "active", makerData.getActiveUnitNum() >= i+1 );
	});

	log( '카드가 ' + makerData.getCardNum() + '개 있습니다.');
	while ( makerData.getCardNum() < $('.input .card').length ) {
		$('.input .card:last').remove();
	}
	while ( makerData.getCardNum() > $('.input .card').length ) {
		var clone = $cardProto.clone().insertBefore( $('.add-card') );
		initializeCard( clone );
	}

	$('.input .card').each( function( i ) {
		var card = makerData.getCard( i );
		$(this).find('.card-thumb').html( card['idol'] !== null ? idolNames[card['idol']] : '' );
		$(this).find('.card-dance').attr('value', card['dance'])
		$(this).find('.card-vocal').attr('value', card['vocal'])
		$(this).find('.card-performance').attr('value', card['performance'])
	} );

	$('.input .card .remove-card').toggleClass( "disabled", makerData.getCardNum() <= minCardNum );
}

var unitSkills = [];
function initializeUnitSkills() {
	var url = 'https://femiwiki.com/index.php?title=유닛 스킬(앙상블스타즈_for_kakao)&action=raw';
	
	$.ajax({
        type: 'GET',
        url: 'https://femiwiki.com/api.php?'
        	+'action=query'
        	+'&format=json'
        	+'&prop=revisions'
        	+'&titles=유닛+스킬(앙상블스타즈+for+kakao)'
        	+'&rvprop=content'
        	+'&callback=?',
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
        	var raw = ''
        	for ( var pageId in data['query']['pages'] ) {
        		raw = data['query']['pages'][pageId]['revisions'][0]['*'];
        		break;
        	}

		 	var raw = /{{#invoke:ensemblestars‎‎\|unitSkill\s*([^}]+)}}/.exec(raw)[1];
        	var lines = raw.split('\n');
			var eventName = /\|이벤트=([^\n]+)/.exec( raw )[1];
			for ( var i in lines ) {
				if ( !lines[i].includes(',') )
					continue;

				var unitSkill = {};
				unitSkill.member = [];

				var words = lines[i].split( ',' );
				var worthless = false;
				for ( var j in words ) {
					if ( words[j].includes(':') ) {
						var before = /\|?\s*([^:]+)/.exec( words[j] )[1];
						var after = /:(.+)/.exec( words[j] )[1];
						switch( before ) {
							case '아르바이트': 
								worthless = true;
							case '이벤트':
								if ( after != eventName )
									worthless = true;
								break;
							case '이름':
								unitSkill['name'] = after;
								break;
							case '댄스':
							case '보컬':
							case '퍼포먼스':
								unitSkill['type'] = before;
								unitSkill['bonus'] = parseInt( after, 10 );
								break;
						}
						if ( worthless ) break;
					} else {
						unitSkill['member'].push( idolNumbers[/\s*.+ (.+)\s*/.exec( words[j] )[1]] );
					}

					if ( worthless ) break;
				}
				if ( !worthless )
					unitSkills.push( unitSkill );
			}
        }
    });
}

$( document ).ready( function() {
	$cardProto = $('.input .card').clone();
	initializeCard($('.input .card'));

	log( '쿠키가 있는지 확인합니다.' )
	var cookie = document.cookie;
	if ( cookie != undefined && cookie != '' ) {
		log( '쿠키는 다음과 같습니다: '+cookie);
		var dataStr = cookie.match(/deckMakerData=([^;]+)/);
		if ( dataStr != null ) {
			log( '쿠키에서 data를 가져왔습니다: '+dataStr[1]);
			makerData = new DeckMakerData( dataStr[1] );
		}
		else {
			log( '쿠키에서 data를 가져오는데 실패하였습니다.');
			makerData = new DeckMakerData();
		}
	}
	else {
		log( '쿠키가 없습니다.');
		makerData = new DeckMakerData();
	}
	initializeUnitSkills();

	for ( var i in idolNames ) {
		var $idol = $('<li></li>').addClass( 'idol-picker-idol' ),
		$anchor = $('<a></a>').attr( 'href','#' ).click( function( e ) {
			var index = $(this).parent().prevAll().length;
			event.preventDefault();
			var card = makerData.getCard( pickerIndex );
			card['idol'] = index;
			makerData.setCardAt( pickerIndex, card );
			$('.overlay').toggle( false );
			refreshPanels();
		} ).html(idolNames[i]);
		$idol.append( $anchor );
		$idol.appendTo($('.idolPicker ol'));
	}

	$('.switch').click( function(event) {
		event.preventDefault();
		index = $(this).parent().parent().prevAll().length;

		makerData.setActiveUnitNum( index + ($(this).parent().hasClass('active')?0:1) );
		refreshPanels();
	} );

	$('#deck-option-dance a').click( function(event) {
		event.preventDefault();
		makerData.setTypeOfDeck( 'dance' );
		refreshPanels();
	} );

	$('#deck-option-vocal a').click( function(event) {
		event.preventDefault();
		makerData.setTypeOfDeck( 'vocal' );
		refreshPanels();
	} );

	$('#deck-option-performance a').click( function(event) {
		event.preventDefault();
		makerData.setTypeOfDeck( 'performance' );
		refreshPanels();
	} );

	$('.deck-total-ability a').click( function( event ) {
		event.preventDefault();
		var crtType = makerData.getTypeOfDeck();
		if ( crtType == 'dance' )
			makerData.setTypeOfDeck( 'vocal' );
		if ( crtType == 'vocal' )
			makerData.setTypeOfDeck( 'performance' );
		else if ( crtType == 'performance' )
			makerData.setTypeOfDeck( 'dance' );
		refreshPanels();
	});

	$('.add-card a').click( function(event) {
		event.preventDefault();
		makerData.addCard();
		refreshPanels();
	});

	$('.overlay').click( function(event) {
		$(this).toggle( false );
	});

	$('#import').click( function(event) {
		event.preventDefault();

		var str = window.prompt("「내보내기」한 텍스트를 붙여넣어 주세요.","");
		if ( str != null &&  str != '' ){
			makerData = new DeckMakerData(str);
			writeCookie();
			refreshPanels();
		}
	});
	
	$('#export').click( function(event) {
		event.preventDefault();

		$('.export').toggle( true );
		$('#export-text').html(makerData.getCode()).select();;
	});

	$('#export-text').on( "click", function(e) {
	   $(this).select();
	});

	refreshPanels();

	$('.deck').toggleClass('loading');
} );