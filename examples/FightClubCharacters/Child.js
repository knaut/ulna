define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Component',
    'commonjs/features/refineByFacet/lib/stores/examples/ChildStore',
    'commonjs/features/refineByFacet/lib/dispatcher/examples/Dispatch',
    'text!commonjs/features/refineByFacet/lib/templates/examples/Child.html'
], function ( Logger, $, _, Component, ChildStore, Dispatch, childTemplate ) {

    var Child = Component.extend( {
        template: childTemplate,

        events: {
            '.check': 'toggleHandler'
        },

        init: function () {
            this._setup();

            this.store = new ChildStore( {
                parent: this,
                state: {
                    selected: false
                }
            } );

            this.store.on( 'componentUpdate', this.update, this );
        },

        toggleHandler: function ( e ) {
            // console.log( 'Child: toggleHandler' );

            var cid = this.cid;
            Dispatch.dispatch( 'item_select', this.cid );
        },

        _renderTemplate: function () {
            var rendered = _.template( this.template );
            rendered = rendered( this.data );

            this.$el = $( rendered );
            this.parent._addChild( this );
        },

        update: function () {
            if ( this.store.getState( 'selected' ) ) {
                this.$el.find( '.check' ).addClass( 'selected' );
            } else {
                this.$el.find( '.check' ).removeClass( 'selected' );
            }
        }
    } );

    return Child;

} );
