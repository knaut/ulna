describe( 'toType', function() {

	it( 'should return a string of the object\'s type', function() {

		// array
		expect( toType( [] ) ).toEqual('array');

		// object
		expect( toType( {} ) ).toEqual('object');

		// function
		expect( toType( function(){} ) ).toEqual('function');

		// number
		expect( toType( 0 ) ).toEqual('number');

		// string
		expect( toType( 'test' ) ).toEqual('string');
	});

});
