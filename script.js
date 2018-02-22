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
for ( i in idolNumbers )
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

function makeBestDeck() {
	var deck = [ [/* [ 5, 134 ], [3, 155 ] */], [], [] ];
	var type = makerData.getTypeOfDeck();
	var idolList = [];
	for ( var i = 0; i < makerData.getCardNum(); i++ ) {
		var card = makerData.getCard( i );
		idolList.push( [ card['idol'], card[type] ] );
	}
	idolList.sort( function(a, b) { return b[1] - a[1]; } );

	for ( var i = 0; i < makerData.getActiveUnitNum() * 5; i++ ) {
		deck[i] = idolList[i];
	}
	return deck;
}

function refreshPanels() {
	writeCookie();
	log('패널을 새로고침합니다.');

	var deckTotalAbility = 0;
	var mainUnitTotalAbility = 0;
	var subUnitTotalAbility = 0;
	var secondSubUnitTotalAbility = 0;
	var mainUnitSkillNum = 0;
	var subUnitSkillNum = 0;
	var secondSubUnitSkillNum = 0;
	
	var deck = makeBestDeck();

	// 총합 계산
	for ( var i = 0; i < makerData.getActiveUnitNum() * 5; i++ ) {
		if ( i < 5 )
			mainUnitTotalAbility += deck[i][1];
		else if ( i < 10 )
			subUnitTotalAbility += deck[i][1];
		else
			secondSubUnitTotalAbility += deck[i][1];			
	}

	deckTotalAbility = mainUnitTotalAbility
		+ subUnitTotalAbility
		+ secondSubUnitTotalAbility;
	if ( makerData.getActiveUnitNum() == 2 )
		deckTotalAbility *= 1.5;
	else if ( makerData.getActiveUnitNum() == 3 )
		deckTotalAbility *= 2;


	// 계산 결과 표시
	$('#deck-total-ability').html(deckTotalAbility);
	var $unitTotals = $('.unit-total-ability');
	$unitTotals.eq(0).html( mainUnitTotalAbility );
	$unitTotals.eq(1).html( subUnitTotalAbility );
	$unitTotals.eq(2).html( secondSubUnitTotalAbility );

	var $unitSkillNum = $('.unit-skill-number');
	$unitSkillNum.eq(0).html( mainUnitSkillNum);
	$unitSkillNum.eq(1).html( subUnitSkillNum );
	$unitSkillNum.eq(2).html( secondSubUnitSkillNum );

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
	$('#unit2-switch').toggleClass( "active", makerData.getActiveUnitNum() >= 2 );
	$('#unit3-switch').toggleClass( "active", makerData.getActiveUnitNum() >= 3 );

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
	$.ajax( { url: url, success: function( data ) {
		// data ="{{책날개 버튼|앙상블스타즈 for kakao}}\n\n'''유닛 스킬'''은 [[앙상블스타즈 for kakao]]에서 [[대결(앙상블스타즈 for kakao)|대결]], [[콘서트(앙상블스타즈 for kakao)|라이브 콘서트]], [[아르바이트]]를 하는 유닛의 멤버 구성이 일정 조건을 갖추면 능력치나 보상이 상승하는 시스템이다. 유닛 스킬이 발동하기 위해서는 해당 조건에 속하는 멤버 중 한 명이 유닛의 리더여야 한다.__목차__\n\n{{#invoke:ensemblestars‎‎|unitSkill\n|이벤트=개막! 유메노사키 서커스\n|이름:같은 반 베프, 아르바이트:야외 무대 공연, Fantasy:4, Cool:4, Active:4, 나구모 테토라, 시노 하지메, 마시로 토모야\n|이름:유성대, 조건:유닛, 보컬:18, 나구모 테토라, 타카미네 미도리, 센고쿠 시노부, 모리사와 치아키, 신카이 카나타\n|이름:가라테부, 조건:동아리, 댄스:5, 키류 쿠로, 나구모 테토라\n|이름:능숙한 재봉, 퍼포먼스:5, 키류 쿠로, 시노 하지메\n|이름:Ra*bits, 조건:유닛, 보컬:13, 시노 하지메, 마시로 토모야, 텐마 미츠루, 니토 나즈나\n|이름:홍차부, 조건:동아리, 보컬:10, 시노 하지메, 사쿠마 리츠, 텐쇼인 에이치\n|이름:알바의 달인, 아르바이트:광고 디자인 제작, Fantasy:2, Cool:2, Active:2, 아케호시 스바루, 시노 하지메\n|이름:연극부, 조건:동아리, 퍼포먼스:10, 마시로 토모야, 히다카 호쿠토, 히비키 와타루\n|이름:2wink, 조건:유닛, 보컬:5, 아오이 유우타, 아오이 히나타\n|이름:경음부, 조건:동아리, 댄스:13, 아오이 히나타, 아오이 유우타, 오오가미 코가, 사쿠마 레이\n|이름:위장의 달인, 아르바이트:광고 디자인 제작, Active:4, 아오이 히나타, 아오이 유우타, 히비키 와타루\n|이름:태어났을 때부터 형, 아르바이트:아르바이트, Active:4, 아오이 히나타, 키류 쿠로, 사쿠마 레이\n|이름:고양이과 동맹, 아르바이트:아르바이트, Cool:4, 아오이 히나타, 아오이 유우타, 나루카미 아라시\n|이름:농구부, 조건:동아리, 보컬:13, 타카미네 미도리, 아케호시 스바루, 이사라 마오, 모리사와 치아키\n|이름:fine, 조건:유닛, 퍼포먼스:13, 히메미야 토리, 후시미 유즈루, 텐쇼인 에이치, 히비키 와타루\n|이름:학생회 집행부, 보컬:13, 히메미야 토리, 이사라 마오, 하스미 케이토, 텐쇼인 에이치\n|이름:테니스부, 조건:동아리, 퍼포먼스:13, 히메미야 토리, 유우키 마코토, 세나 이즈미, 니토 나즈나\n|이름:재벌가, 댄스:10, 히메미야 토리, 스오우 츠카사, 텐쇼인 에이치\n|이름:애완견 동호회, 아르바이트:아르바이트, Fantasy:4, 히메미야 토리, 아케호시 스바루, 오오가미 코가\n|이름:닌자 동호회, 조건:동아리, 퍼포먼스:2, 센고쿠 시노부\n|이름:소형 레이더, 아르바이트:광고 디자인 제작, 고평점:9, 히메미야 토리, 세나 이즈미, 신카이 카나타\n|이름:방송위원회, 댄스:10, 센고쿠 시노부, 유우키 마코토, 니토 나즈나\n|이름:전국시대의 전통, 아르바이트:광고 디자인 제작, 고평점:4, 칸자키 소마, 센고쿠 시노부\n|이름:왼손잡이, 퍼포먼스:10, 아오이 유우타, 사쿠마 리츠, 텐쇼인 에이치\n|이름:육상부, 조건:동아리, 보컬:10, 텐마 미츠루, 오토가리 아도니스, 나루카미 아라시\n|이름:금강산도 식후경, 아르바이트:야외 무대 공연, Fantasy:2, Cool:2, Active:2, 오토가리 아도니스, 텐마 미츠루\n|이름:궁도부, 조건:동아리, 댄스:10, 스오우 츠카사, 후시미 유즈루, 하스미 케이토\n|이름:Knights, 조건:유닛, 퍼포먼스:13, 스오우 츠카사, 사쿠마 리츠, 나루카미 아라시, 세나 이즈미\n|이름:착실한 줏대, 아르바이트:야외 무대 공연, 고평점:9, 히다카 호쿠토, 스오우 츠카사, 하스미 케이토\n|이름:Trickstar, 조건:유닛, 댄스:13, 아케호시 스바루, 히다카 호쿠토, 유우키 마코토, 이사라 마오\n|이름:모델 경험자, 댄스:10, 유우키 마코토, 나루카미 아라시, 세나 이즈미\n|이름:지적인 안경, 보컬:5, 하스미 케이토, 유우키 마코토\n|이름:홍월, 조건:유닛, 댄스:10, 칸자키 소마, 하스미 케이토, 키류 쿠로\n|이름:해양생물부, 조건:동아리, 퍼포먼스:10, 칸자키 소마, 하카제 카오루, 신카이 카나타\n|이름:UNDEAD, 조건:유닛, 댄스:13, 오토가리 아도니스, 오오가미 코가, 하카제 카오루, 사쿠마 레이\n|이름:꽃가루 알레르기, 보컬:5, 이사라 마오, 오오가미 코가\n|이름:옛 동료, 아르바이트:인형탈 프로모션, Fantasy:4, Cool:4, Active:4, 오오가미 코가, 하스미 케이토, 사쿠마 레이\n|이름:사쿠마 형제, 보컬:5, 사쿠마 레이, 사쿠마 리츠\n|이름:소꿉친구, 아르바이트:인형탈 프로모션, Fantasy:2, Cool:2, Active:2, 사쿠마 리츠, 이사라 마오\n|이름:자유로운 행동, 아르바이트:인형탈 프로모션, 고평점:4, 사쿠마 리츠, 하카제 카오루, 신카이 카나타\n|이름:삼기인, 퍼포먼스:10, 히비키 와타루, 신카이 카나타, 사쿠마 레이\n|이름:마칭 밴드, 이벤트:봄바람! 꽃잎 흩날리는 벚꽃 페스티벌, 댄스:10, 시노 하지메, 마시로 토모야, 텐마 미츠루, 니토 나즈나\n|이름:디저트 파티시에, 이벤트:개막! 유메노사키 서커스, 댄스:10, 스오우 츠카사, 사쿠마 리츠, 나루카미 아라시, 세나 이즈미\n}}\n\n{{분류|종류/앙상블스타즈 for kakao 스킬}}\n{{앙상블스타즈 for kakao 책날개}}";
		var raw = /{{#invoke:ensemblestars‎‎\|unitSkill\s*([^}]+)}}/.exec(data)[1];
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
							unitSkill['bonus'] = after;
							break;
					}
					if ( worthless ) break;
				} else {
					unitSkill['member'].push( /\s*(.+)\s*/.exec( words[j] )[1] );
				}

				if ( worthless ) break;
			}
			if ( !worthless )
				unitSkills.push( idolNumbers[unitSkill] );
		}
	} } );
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
		// ----------
		// makerData = new DeckMakerData('0023120b0000000000054b31700000000000548b0c000000000004ede1200000000000416409000000000003c4a060000000000039cc110000000000034c4150000000000032c61c000000000002f0c0200000000000291e0e00000000000268b010000000000023860a0000000000022b617000000000001f0318000000000001bef0f000000000001a541c000000000001a4a030000000000019c9');
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

		makerData.setActiveUnitNum( index + ($(this).hasClass('active')?0:1) );
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

	$('#export-text').on( "click", function(e) {
	   $(this).select();
	});
	
	$('#export').click( function(event) {
		event.preventDefault();

		$('.export').toggle( true );
		$('#export-text').html(makerData.getCode());
	});

	refreshPanels();

	$('.deck').toggleClass('loading');
} );