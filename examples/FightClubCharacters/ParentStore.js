define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Store',
    'commonjs/features/refineByFacet/lib/dispatcher/Dispatch'
], function ( Logger, $, _, Store, Dispatch ) {

    var ParentStore = Store.extend( {
        bindInternals: function () {
            this.on( 'startLifecycle', this._startLifecycle, this );
            this.on( 'shouldComponentUpdate', this.shouldComponentUpdate, this );
        },
        registerWithDispatcher: function () {
            Dispatch.register( 'child_updated', this, 'handleChildUpdated' );
            Dispatch.register( 'parent_clear', this, 'handleParentClear' );
        },

        handleChildUpdated: function () {
            // arguments is an object with the child state and cid
            var childMsg = arguments;
            if ( !this.parent.ensureThisHasChildBasedOnCid( childMsg.cid ) ) {
                return;
            } else {
                this.trigger( 'startLifecycle', childMsg );
            }
        },

        handleParentClear: function () {
            // console.log( 'handleParentClear' );
        },

        startUpdate: function () {
            // not much to do here yet
            return true;
        },

        onUpdate: function () {
            // console.log('update', arguments)
            var child = arguments;
            var nextState = this.getCurrentState(); // clone our state

            // mutate parent's state based on child's state
            if ( child.selected ) {
                nextState.selectedItems.push( child.cid );
            } else {
                nextState.selectedItems = _.without( nextState.selectedItems, child.cid );
            }

            if ( nextState.selectedItems.length ) {
                nextState.clearable = true;
            } else {
                nextState.clearable = false;
            }

            // console.log('nextState', nextState);
            // console.log(this.shouldComponentUpdate)
            return this.shouldComponentUpdate( nextState );
        },

        // we can overrule shouldComponentUpdate if we need to do more
        // than just deep equality check
        shouldComponentUpdate: function () {
            var nextState = arguments;
            // console.log(nextState)
            var currentState = this.getCurrentState();

            // console.log( nextState, currentState )

            // workaround/check for undefined nextState
            if ( nextState === undefined ) {
                return false;
            } else {

                // we have a state, set it
                this.setState( nextState );

                // only update component if clearable has changed
                if ( nextState.clearable !== currentState.clearable ) {
                    this.trigger( 'componentUpdate' );
                }
            }

            // decide if we should continue to afterUpdate
            if ( nextState.clearable !== currentState.clearable ||
                nextState.selectedItems.length !== nextState.selectedItems.length ) {
                // everything is different, continue
                return true;
            } else {
                // if nothing's different, everything is the same
                // console.log('shouldComponentUpdate', this.cid, false);
                return false;
            }
        },

        afterUpdate: function () {
            // console.log( 'afterUpdate', this.cid, arguments );
        }
    } );

    return ParentStore;

} );
