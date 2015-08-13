define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Component',
    'commonjs/features/refineByFacet/lib/dispatcher/Dispatch'
], function ( Logger, $, _, Component, Dispatch ) {

    var Grandparent = Component.extend( {
        init: function () {
            this._setup();

            Dispatch.register( 'facet_updated', this, 'facetUpdateHandler' );
        },

        clearHandler: function () {
            // console.log( 'Grandparent: clearHandler' );
            this.setState( {
                clearable: false
            } );
        },

        update: function () {
            if ( this.state.clearable ) {
                this.$el.find( '.clearall' ).first().toggleClass( 'clearable' );
            }
        },

        facetUpdateHandler: function ( payload ) {
            // console.log( payload );
        }
    } );

    return Grandparent;

} );
