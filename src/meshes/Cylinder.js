WHS.Cylinder = class Cylinder extends WHS.Shape {

  /**
   * Create a cylinder.
   *
   * @param {Object} params - Cylinder options
   * @param {Object} params.geometry - Cylinder geometry
   * @param {Number} params.geometry.radiusTop - The cylinder's top radius
   * @param {Number} params.geometry.radiusBottom - The cylinder's bottom radius
   * @param {Number} params.geometry.height - The cylinder's height
   * @param {Number} params.geometry.radiusSegments - The number of radius segments the cylinder has
   * @param {Material} params.material - The cylinder's material
   * @param {Number} params.mass - The cylinder's mass
   */
  constructor(params = {}) {

    super(params, 'cylinder');

    WHS.API.extend(params.geometry, {

      radiusTop: 1,
      radiusBottom: 1,
      height: 1,
      radiusSegments: 32

    });

    this.build(params);

    super.wrap();

  }

  build(params = {}) {

    const _scope = this,
      mesh = this.physics ? Physijs.CylinderMesh : THREE.Mesh,
      material = super._initMaterial(params.material);

    return new Promise((resolve, reject) => {

      _scope.setNative(new mesh(
        new THREE.CylinderGeometry(

          params.geometry.radiusTop,
          params.geometry.radiusBottom,
          params.geometry.height,
          params.geometry.radiusSegments

        ),

        material,
        params.mass
      ));

      resolve();

    });

  }

  /**
   * Clone cylinder.
   */
  clone() {

    return new WHS.Cylinder(this.getParams(), this._type).copy(this);

  }

};
