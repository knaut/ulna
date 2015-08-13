define( [
    'logger',
    'jquery',
    'underscore',
    'commonjs/features/refineByFacet/lib/components/examples/Grandparent',
    'commonjs/features/refineByFacet/lib/components/examples/Parent',
    'commonjs/features/refineByFacet/lib/dispatcher/examples/Dispatch',
    'text!commonjs/features/refineByFacet/lib/templates/examples/grandparent.html'
], function ( Logger, $, _, Grandparent, Parent, Dispatch, grandparentTemplate ) {

    var app = new Grandparent( {
        $el: '#app-root',

        Dispatch: Dispatch,

        template: grandparentTemplate,

        children: [],

        childContainer: 'ul',

        childType: Parent,

        state: {
            activeFacets: [],
            clearable: false
        },

        events: {
            '.clearall': 'clearHandler'
        },

        data: {
            name: 'app',

            children: [ {
                name: 'totally real people',
                children: [ {
                    name: 'Jack',
                    about: 'Single servings.'
                }, {
                    name: 'Chloe',
                    about: 'Available.'
                }, {
                    name: 'Lou',
                    about: 'His tavern.'
                } ]
            }, {
                name: 'might be real people',
                children: [ {
                    name: 'Marla',
                    about: 'Wants the whole brain.'
                }, {
                    name: 'Bob',
                    about: 'Moosey.'
                }, {
                    name: 'Angel',
                    about: 'Something beautiful.'
                } ]
            }, {
                name: 'imaginary figments',
                children: [ {
                    name: 'Tyler',
                    about: 'Aweful food service.'
                }, {
                    name: 'The Bartender',
                    about: 'Security is tight as a drum.'
                } ]
            } ]
        }
    } );

    return app;

} );
