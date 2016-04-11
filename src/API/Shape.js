/**
 * © Alexander Buzin, 2014-2015
 * Site: http://alexbuzin.me/
 * Email: alexbuzin88@gmail.com
*/

/** Shape super class */
WHS.Shape = class {
	/**
	 * Constructing WHS.Shape object.
	 * 
	 * @param {Object} params - Inputed parameters.
	 * @param {String} type - Shape type.
	 * @return {WHS.Shape}
	 */
	constructor( params, type ) {

		if ( !type ) 
			console.error( "@constructor: Please specify \" type \"." );

		var _set = function( x, y, z ) {

			this.x = x;
			this.y = y;
			this.z = z;

		}

		// Polyfill for 3D.
		WHS.API.extend(params, {

			mass: 10,

			pos: {
				x: 0,
				y: 0,
				z: 0,
				set: _set
			},

			rot: {
				x: 0,
				y: 0,
				z: 0,
				set: _set
			},

			scale: {
				x: 1,
				y: 1,
				z: 1,
				set: _set
			},

			target: {
				x: 0,
				y: 0,
				z: 0,
				set: _set
			},

			morph: {
				speed: 1,
				duration: 1
			},

			physics: true

		});

		var scope = Object.assign( this,
		{
			_type: type,
			_whsobject: true,
			__releaseTime: new Date().getTime(),
			__params: params,
			parent: null,

			wait: [],

			/*position: params.pos,
			rotation: params.rot,
			scale: params.scale,
			morph: params.morph,
			target: params.target,*/
			physics: params.physics
		},
		new Events());

		if ( WHS.debug ) console.debug("@WHS.Shape: Shape " + scope._type +
			" found.", scope);

		return scope;
	}

	wait( promise ) {

		this.wait.push( promise );
		
		return this;

	}

	/**
	 * Applying shadow & position & rotation.
	 *
	 * @param {...String} tags - Tags that defines what to do with shape 
	 * additionally.
	 */
	build( ...tags ) {
		
		'use strict';

		var _scope = this;

		if (tags.indexOf("wait") >= 0) {

			Promise.all( _scope.wait ).then(function() {

				return new Promise( (resolve, reject) => {

					try {

						_scope.mesh.castShadow = true;
						_scope.mesh.receiveShadow = true;

						_scope.position.set(
							_scope.__params.pos.x, 
							_scope.__params.pos.y, 
							_scope.__params.pos.z 
						);

						_scope.rotation.set( 
							_scope.__params.rot.x, 
							_scope.__params.rot.y, 
							_scope.__params.rot.z 
						);

						_scope.scale.set( 
							_scope.__params.scale.x, 
							_scope.__params.scale.y, 
							_scope.__params.scale.z 
						);

		                if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
		                	+ _scope._type + " is ready.", _scope);

						_scope.emit("ready");

						resolve();

					} catch ( err ) {

						console.error( err.message );
						reject();

					}

				});

			});

		} else {

			return new Promise( (resolve, reject) => {

				try {

					_scope.mesh.castShadow = true;
					_scope.mesh.receiveShadow = true;

					_scope.position.set(
						_scope.__params.pos.x, 
						_scope.__params.pos.y, 
						_scope.__params.pos.z 
					);

					_scope.rotation.set( 
						_scope.__params.rot.x, 
						_scope.__params.rot.y, 
						_scope.__params.rot.z 
					);

					_scope.scale.set( 
						_scope.__params.scale.x, 
						_scope.__params.scale.y, 
						_scope.__params.scale.z 
					);

	                if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
		            	+ _scope._type + " is ready.", _scope);

					resolve();

					_scope.emit("ready");

				} catch ( err ) {

					console.error( err.message );
					reject();

				}

			});

		}

		return this;
	}

	/**
	 * Add shape to WHS.World object.
	 *
	 * @param {WHS.World} parent - World, were this shape will be.
	 * @param {...String} tags - Tags for compiling. 
	 */
	addTo( parent, ...tags ) {

		'use strict';

		this.parent = parent;
		this._lastWorld = parent;

		var _scope = this;

		if ( tags.indexOf("wait") >= 0 ) {

			Promise.all( _scope.wait ).then(function() {

				return new Promise( (resolve, reject) => {

					try {

						WHS.API.merge( _scope.parent.scene, _scope.mesh );
						_scope.parent.children.push( _scope );

					} catch ( err ) {

						console.error( err.message );
						reject();

					} finally {

						if ( _scope._wait ) {

							_scope.mesh.addEventListener('ready', function() {
								resolve( _scope );
							});

						} else {
							resolve( _scope );
						}

						_scope.mesh.addEventListener('collide', function() {
							_scope.emit("collide");
						});

						if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
			                + scope._type + " was added to world.", 
			                [_scope, _scope.parent]);


					}

				});

			});

		} else {

			return new Promise( (resolve, reject) => {

				try {

					WHS.API.merge( _scope.parent.scene, _scope.mesh );
					_scope.parent.children.push( _scope );

				} catch ( err ) {

					console.error( err.message );
					reject();

				} finally {

					if ( _scope._wait ) {

						_scope.mesh.addEventListener('ready', function() {

							resolve( _scope );

						});

					} else {
						resolve( _scope );
					}

					_scope.mesh.addEventListener('collide', function() {
						_scope.emit("ready");
					});

					if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
		                + scope._type + " was added to world", 
		                [_scope, _scope.parent]);

				}

			});
		}
	}

	/**
	 * Initialize shape's material object.
	 */
	_initMaterial( params ) {
		
		return this.physics
			? WHS.API.loadMaterial( params )._material
			: WHS.API.loadMaterial( params )._materialP;
		
	}

	/**
	 * Clone shape.
	 */
	clone() {

		let clone = this.constructor(
				WHS.API.extend({
					pos: this.position,
					rot: this.rotation,
					scale: this.scale,
					morph: this.morph,
					target: this.target,
					physics: this.physics
				}, this.__params),
				this._type
			);

		function isObject( val ) {
			return typeof val === "object" && val !== null;
		}

		function clone_local_obj( obj ) {

			if ( obj instanceof THREE.Mesh ) return obj.clone();
			if ( obj instanceof Element 
				|| obj instanceof Node
				|| obj instanceof WHS.World ) return obj;

			let clone = obj.constructor() || obj;

			for (var key in obj) {
				clone[key] = !isObject( obj[key] )
					? obj[key] 
					: clone_local_obj( obj[key] );
			}

			return clone;

		}

		for (var key in this) {
			clone[key] = !isObject( this[key] )
				? this[key] 
				: clone_local_obj( this[key] );
		}

		return clone;

	}

	/**
	 * Remove this light from world.
	 *
	 * @return {THREE.Shape} - this.
	 */
	remove() {
		
		this.parent.scene.remove( this.mesh );

        this.parent.children.splice( this.parent.children.indexOf( this ), 1);
        this.parent = null;

        this.emit("remove");

        if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
            + this._type + " was removed from world", 
            [_scope]);

		return this;

	}

	/**
	 * Add this light to last applied world.
	 *
	 * @return {THREE.Shape} - this.
	 */
	retrieve() {

        this.parent = this._lastWorld;
                
		this.parent.scene.add( this.mesh );
		this.parent.children.push( this );

		this.emit("retrieve");

		if ( WHS.debug ) console.debug("@WHS.Shape: Shape " 
            + this._type + " was retrieved to world", 
            [_scope, _scope.parent]);

		return this;

	}

	get position() {
		return this.mesh.position;
	}

	set position( vector3 ) {
		this.mesh.__dirtyPosition = true;
		return this.mesh.position.copy( vector3 );
	}

	get rotation() {
		return this.mesh.rotation;
	}

	set rotation( euler ) {
		this.mesh.__dirtyRotation = true;
		return this.mesh.rotation.copy( euler );
	}

	get scale() {
		return this.mesh.scale;
	}

	set scale( vector3 ) {
		return this.mesh.scale = vector3;
	}

	/**
	 * Overwriting mesh position values.
	 *
	 * @param {Number} x - X coord.
	 * @param {Number} y - Y coord.
	 * @param {Number} z - Z coord.
	 * @return {THREE.Shape} - this.
	 */
	setPosition( x, y, z ) {
		this.position.set( x, y, z );
		this.mesh.__dirtyPosition = true;

		return this;
	}

	/**
	 * Overwriting mesh rotation values.
	 *
	 * @param {Number} x - X coord.
	 * @param {Number} y - Y coord.
	 * @param {Number} z - Z coord.
	 * @return {THREE.Shape} - this.
	 */
	setRotation( x, y, z ) {
		this.rotation.set( x, y, z );
		this.mesh.__dirtyRotation = true;

		return this;
	}

}
