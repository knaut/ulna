define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/Dispatcher'
], function ( Logger, $, _, Dispatcher ) {

    var Dispatch = new Dispatcher( {
        actions: [ {
            name: 'item_select',
            beforeEmit: function ( payload, next ) {
                // console.log( 'before emitting payload', payload );
                next( payload );
            },
            shouldEmit: function ( payload ) {
                if ( payload < 2 ) {
                    // console.log( 'cant emit, aborting' );
                    return false;
                }
                // console.log( 'now emitting payload', payload );
                return true;
            }
        }, {
            name: 'child_updated',
            beforeEmit: function ( payload, next ) {
                // console.log('before emitting payload', payload);
                next( payload );
            },
            shouldEmit: function ( payload ) {
                if ( payload < 2 ) {
                    // console.log( 'cant emit, aborting' );
                    return false;
                }
                // console.log('now emitting payload', payload);
                return true;
            }
        }, {
            name: 'parent_clear',
            beforeEmit: function ( payload, next ) {
                // console.log('before emitting payload', payload);
                next( payload );
            },
            shouldEmit: function ( payload ) {
                if ( !payload.hasOwnProperty( 'cid' ) ) {
                    // console.log( 'cant emit, aborting' );
                    return false;
                }
                // console.log( 'now emitting payload', payload );
                return true;
            }
        } ]

    } );

    return Dispatch;

} );
