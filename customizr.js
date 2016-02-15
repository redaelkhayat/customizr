/*
  regular expressions */
var regex = {
  selector: /([a-z0-9-_.+>~:#\s,\[\]\(\)]+)\{/gi,
  dict: /[^:\s]+:[^;]+;?/gi,
  propval: /([^:\s]+):\s*([^;]+);?/,
  rgba: /rgba?\(\s*([0-9]+\s*,?\s*){3}(\.\d+|[0-1](\.\d+)?)?\s*\)/gi,
  hexcolor: /#([0-9a-f]{6}|[0-9a-f]{3})/gi
};

/*
	colors names list */
var webcolors = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen'
];

regex.webcolor = new RegExp('\\b('+webcolors.join('|')+')\\b', 'gi');

/*
  customizr */
function customizr(input){
  this.input = input;
  this.stylesheets = this.parse();
};

/*
  extract colors */
customizr.prototype.extract = function(stylesheets){
	stylesheets = stylesheets || this.stylesheets;

  /*
    all propeties/colors/selectors extracted */
  var properties = [];
  var scheme = [];
  var selectors = [];

  /*
    minified list for the relations between selectors/properties and colors */
  var _rels_index = [];

  /*
    extract colors */
  for(var i=0; i < stylesheets.length; i++){
    for(var prop=0; prop < stylesheets[i].props.length; prop++){
      var _color = stylesheets[i].props[prop][1].matches(regex.rgba,regex.hexcolor,regex.webcolor);
      if( false !== _color ) {
        /*
          clean */
        var _color_index = [];
        _color = _color.map(function(c){
          c = c.toLowerCase().hexshort().replace(/\s/g, '').replace('0.', '.');
          _color_index.push(scheme.pushUniq(c));
          return c;
        });

        _rels_index.push([selectors.pushUniq(stylesheets[i].selector),properties.pushUniq(stylesheets[i].props[prop][0]),_color_index].join('-'));
      }
    }
  }

  /*
    generate an array of distinct styles objects */
  var rels = [];
  var distinct = [];

  for(var i=0, len=_rels_index.length; i < len; i++){
    var _spt_i = _rels_index[i].split('-');
    if( distinct.indexOf(_spt_i[1]+'-'+_spt_i[2]) != -1 ){
      continue;
    }
    var _color = [], _prop = [], _sel = [];
    _color = _spt_i[2].split(',').map(function(index){
      return scheme[index];
    });
    for(var j=0; j < len; j++){
      var _spt_j = _rels_index[j].split('-');
      if( _spt_i[1] == _spt_j[1] && _spt_i[2] === _spt_j[2] ){
        distinct.push(_spt_j[1]+'-'+_spt_j[2]);

        _sel.pushUniq(selectors[_spt_j[0]]);
        _prop.pushUniq(properties[_spt_j[1]]);
      }
    }
    if( _prop.length ) {
      var concat = false;
      for(var k=0; k < rels.length; k++){
        if( rels[k].scheme.equal(_color) && rels[k].selectors.equal(_sel) ){
          concat = true;
          rels[k].properties = rels[k].properties.concat(_prop);
        }
      }
      if( ! concat ){
        rels.push({
          scheme: _color,
          properties: _prop,
          selectors: _sel
        });
      }
    }
  }

  return {
    scheme: scheme, stylesheets: rels
  };

};

/*
  parse stylesheets to a list of selectors/properties */
customizr.prototype.parse = function(){

  var result = [];

  var selectors = (this.input.match(regex.selector) || []).map(function(sel){
    return sel.trim().replace(/\s*\{$/, '');
  });

  for(var s=0; s < selectors.length; s++){
    var dict = this.input.match(new RegExp(selectors[s].replace(/([\[\(\]\)\.\+])/g, '\\$1')+'\\s*{([^\\}]+)', 'i'));
    if( null === dict )
      continue;

    dict = dict[1].match(regex.dict).map(function(propval){
      var match = propval.match(regex.propval);
      return [match[1],match[2]];
    });

    result.push({
      selector: selectors[s].replace(/\s*([,+~])\s*/g, '$1'), props: dict
    });
  }

  return result;

}

/*
  call to action */
customizr.apply = function(input){
  return new customizr(input);
};

/*
  helpers */
/*
  multiple matches(regex)
  	takes at least one argument */
String.prototype.matches = function(){
  var result = [];
  for(var arg=0; arg < arguments.length; arg++){
    if( ! arguments[arg] instanceof RegExp ){
      continue;
    }
    var match = this.match(arguments[arg]);
    if( null != match ){
      result = result.concat(match['index'] !== undefined? match[0]: match);
    }
  }
  return result.length? result: false;
};
/*
  convert 6 digits hex to 3 digits
		e.g. #aabbcc = #abc
  */
String.prototype.hexshort = function(){
  var string = this+'';
  var rgb = this.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
  if( null == rgb )
    return string;

  var shortrgb = '';
  for(var c=1; c <= 3; c++){
    if( rgb[c][0] != rgb[c][1] ){
      return string;
    }
    shortrgb += rgb[c][0];
  }
  return '#'+shortrgb;
};
/*
  check if an array is equal to another */
Array.prototype.equal = function(array){
  if( this.length != array.length ){
    return false;
  }
  for(var i=0; i < this.length; i++){
    if( this[i] !== array[i] ) return false;
  }
  return true;
};
/*
  if the val doesn't exist, insert it / else ignore the operation */
Array.prototype.pushUniq = function(val){
  if( this.indexOf(val) == -1 ){
    this.push(val);
  }
  return this.indexOf(val);
};