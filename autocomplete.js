/**
 * Autocompletion using Ajax
 *
 * @version 1.0
 * @author wolxXx
 * @package Autocomplete
 */


/**
 * a single autocomplete element
 */
var AutocompleteElement = new Class({
	initialize: function(value, target){
		var that = this;
		that.value = value;
		that.element = new Element('a');
		that.element.set('text', this.value);
		that.element.addClass('autocompleteElement');
		that.element.inject(target.container);
		that.isSelecting = false;
		that.element.addEvent('mouseenter', function(){
			that.hover();
		});
		that.element.addEvent('mouseleave', function(){
			that.blur();
		});
	},
	getElement: function(){
		return this.element;
	},
	hover: function(){
		this.element.addClass('active');
	},
	blur: function(){
		this.element.removeClass('active');
	},
	getValue: function(){
		return this.value;
	}
});

/**
 * autocompletion manager
 */
var Autocomplete = new Class({
	initialize: function(element, key){
		this.element = element;
		this.element.addClass('autocompleteInput');
		this.key = key;
		this.request = null;
		this.container = null;
		this.controls = ['up', 'down', 'esc', 'enter'];
		this.addListeners();
		this.elements = [];
		this.currentElement = null;
		this.isSelecting = false;
	},
	disposeContainer: function(){
		if(null !== this.container){
			this.container.dispose();
		}
	},
	loading: function(){
		this.container.set('html', '<img src="/img/loading.gif" />');
	},
	clearContainer: function(){
		this.container.set('html', '');
	},
	addContainer: function(){
		$$('.autocompleteOut').each(function(current){
			current.dispose();
		});
		this.container = new Element('div');
		this.container.set('class', 'autocompleteOut');
		var width = parseInt(this.element.getStyle('padding-left'));
		width += parseInt(this.element.getStyle('padding-right'));
		width += parseInt(this.element.getStyle('width'));
		width += 'px';
		this.container.setStyles({
			'top': this.element.getPosition().y + 30,
			'left': this.element.getPosition().x,
			'width': width,
		});
		this.container.inject(this.element.getParent());
	},
	addListeners: function(){
		var that = this;
		this.element.addEvent('keyup', function(event){
			that.keyup(event);
		});
		this.element.addEvent('focus', function(event){
			that.focus(event);
		});
		this.element.addEvent('blur', function(){
			that.blur();
		});
		this.element.getParent('form').addEvent('submit', function(){
			if(null !== that.currentElement){
				return false;
			}
		});
	},
	takeInputValue: function(){
		var that = this;
		var selected = false;
		$$('.autocompleteElement.active').each(function(current){
			that.element.set('value', current.get('text'));
			selected = true;
		});

		if(false === selected && null !== this.currentElement){
			this.element.set('value', this.elements[this.currentElement].getValue());
			selected = true;
		}
		if(false === selected){
			return false;
		}

		this.elements = [];
		this.currentElement = null;
		this.disposeContainer();
		this.element.fireEvent('blur');
	},
	hasElements: function(){
		return 0 !== this.elements.length;
	},
	blurAllHoveCurrentAndScroll: function(){
		this.elements.each(function(current){
			current.blur();
		});
		this.elements[this.currentElement].hover();
		var offset = parseInt(this.elements[this.currentElement].getElement().getScrollSize().y);
		offset += parseInt(this.elements[this.currentElement].getElement().getStyle('margin-top'));
		offset += parseInt(this.elements[this.currentElement].getElement().getStyle('margin-bottom'));
		offset += parseInt(this.elements[this.currentElement].getElement().getStyle('padding-top'));
		offset += parseInt(this.elements[this.currentElement].getElement().getStyle('padding-bottom'));
		//don't ask. fuck box model fuck up fuck#!?|
		offset += 1;
		this.container.scrollTop = offset * (this.currentElement - 2);
	},
	activateNext: function(){
		if(false === this.hasElements()){
			return false;
		}

		if(null === this.currentElement || this.currentElement == this.elements.length -1){
			this.currentElement = -1;
		}
		this.currentElement++;
		this.blurAllHoveCurrentAndScroll();
	},
	activatePrevious: function(){
		if(false === this.hasElements()){
			return false;
		}

		if(null === this.currentElement || this.currentElement == 0){
			this.currentElement = this.elements.length;
		}
		this.currentElement--;
		this.blurAllHoveCurrentAndScroll();
	},
	addElement: function(value){
		this.elements.push(new AutocompleteElement(value, this));
	},
	handleControl: function(key){
		switch (key) {
			case 'enter':{
				this.takeInputValue();
			}break;
			case 'down':{
				this.activateNext();
			}break;
			case 'up':{
				this.activatePrevious();
			}break;
			case 'esc':{
				this.killRequest();
				this.disposeContainer();
				this.currentElement = null;
				this.elements = [];
			}break;
			default:{
				alert('WTF?! wie jehtn ditte?!');
			}break;
		}
	},
	killRequest: function(){
		if(null !== this.request){
			this.request.cancel();
		}
		this.request = null;
	},
	keyup: function(event){
		if(null !== this.request){
			this.killRequest();
		}
		if(true === this.controls.contains(event.key)){
			this.handleControl(event.key);
			return true;
		}
		if(this.element.get('value').length > 0){
			this.pullCompletions();
		}
	},
	focus: function(){
		this.element.addClass('active');
	},
	blur: function(){
		if(null !== this.currentElement){
			this.takeInputValue();
		}
		this.element.removeClass('active');
		this.disposeContainer();
	},
	pullCompletions: function(){
		var that = this;
		this.elements = [];
		this.currentElement = null;
		that.request = new Request.JSON({
			url : '/api/autoComplete',
			data : {
				'search' : that.element.get('value'),
				'field' : that.key
			},
			onSuccess : function(response) {
				that.clearContainer();
				that.addElement(that.element.get('value'));
				response.data.each(function(current){
					if(current.field !== that.element.get('value')){
						that.addElement(current.field);
					}
				});
				that.activateNext();
			}
		});
		this.addContainer();
		this.loading();
		that.request.send();
	}
});
