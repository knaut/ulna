define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Component',
    'commonjs/features/refineByFacet/lib/stores/ParentStore',
    'commonjs/features/refineByFacet/lib/components/examples/Child',
    'commonjs/features/refineByFacet/lib/dispatcher/examples/Dispatch',
    'text!commonjs/features/refineByFacet/lib/templates/examples/Parent.html'
], function ( Logger, $, _, Component, ParentStore, Child, Dispatch, parentTemplate ) {

    var Parent = Component.extend( {
        children: [],

        childContainer: 'ul',

        childType: Child,

        template: parentTemplate,

        events: {
            '.clear': 'clearHandler',
            '.toggle': 'toggleHandler'
        },

        init: function () {
            this._setup();

            this.store = new ParentStore( {
                parent: this,
                state: {
                    clearable: false,
                    selectedItems: []
                }
            } );

            this.store.on( 'componentUpdate', this.update, this );
        },

        clearHandler: function () {
            // console.log( 'Parent: clearHandler' );

            Dispatch.dispatch( 'parent_clear', {
                cid: this.cid
            } );
        },

        toggleHandler: function ( e ) {
            // console.log( 'Parent: toggleHandler' );

            this.$el.toggleClass( 'expanded' );
        },

        _renderTemplate: function () {
            var rendered = _.template( this.template );
            rendered = rendered( this.data );

            this.$el = $( rendered );
            this.parent._addChild( this );
        },


        beforeUpdate: function ( payload ) {
            // console.log( payload );

            // if ( payload === this.cid ) {}
        },

        update: function ( obj ) {
            if ( this.store.getState( 'clearable' ) ) {
                this.$el.find( '.clear' ).addClass( 'clearable' );
            } else {
                this.$el.find( '.clear' ).removeClass( 'clearable' );
            }
        }
    } );

    return Parent;

} );
