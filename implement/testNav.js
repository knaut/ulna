var dispatcher = new Dispatcher({
	actions: [
		'NAV_CHANGE'
	]
});

var frame = new Component({
	root: '#frame',

	dispatcher: dispatcher,

	template: {
		span: '~~data~~'
	},

	props: {
		data: 'nothing yet'
	},

	listen: {
		'NAV_CHANGE': function(payload) {
			this.setProps(payload);
		}
	}
});

var nav = new Component({
	root: '#nav',

	dispatcher: dispatcher,

	template: {
		nav: {
			ul: [
				{ li: 'Test1' },
				{ li: 'Test2' },
				{ li: 'Test3' },
			]
		},
		'#frame': frame
	},

	events: {
		'click li': function(event) {
			this.dispatcher.dispatch('NAV_CHANGE', {
				data: event.target.innerText
			})
		}
	},

	listen: {
		'NAV_CHANGE': function(payload) {
			console.log(payload)
		}
	}
});

