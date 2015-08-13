define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Store',
    'commonjs/features/refineByFacet/lib/dispatcher/Dispatch'
], function ( Logger, $, _, Store, Dispatch ) {

    var ChildStore = Store.extend( {
        registerWithDispatcher: function () {
            Dispatch.register( 'item_select', this, 'handleItemSelect' );
        },

        handleItemSelect: function () {
            // payload is the cid
            var cid = arguments;
            if ( this.parent.cid !== cid ) {
                return;
            } else {
                this.trigger( 'startLifecycle', cid );
            }
        },

        startUpdate: function () {
            // nothing to do here, move along
            return true;
        },

        onUpdate: function () {
            var prevState = this.getCurrentState();

            this.setState( {
                selected: !prevState.selected
            } );

            // skip shouldComponentUpdate, just a toggle here
            this.trigger( 'componentUpdate', this.parent );

            return true;
        },

        afterUpdate: function () {
            // inform everyone of our change
            var payload = {
                selected: this.getState( 'selected' ),
                cid: this.parent.cid
            };

            Dispatch.dispatch( 'child_updated', payload );
        }
    } );

    return ChildStore;

} );
