import {
  Mesh,
  DodecahedronBufferGeometry,
  DodecahedronGeometry
} from 'three';



import {Component} from '../../core/Component';
import {MeshComponent} from '../../core/MeshComponent';
import {loadMaterial} from '../../utils/index';

@MeshComponent
class Dodecahedron extends Component {
  static defaults = {
    ...Component.defaults,
    geometry: {
      radius: 1,
      detail: 0
    },

    physics: {
      create: false
    }
  };

  static instructions = {
    ...Component.instructions,
    geometry: ['radius', 'detail']
  };

  constructor(params = {}) {
    super(params, Dodecahedron.defaults, Dodecahedron.instructions);

    if (params.build) {
      this.build(params);
      super.wrap();
    }
  }

  build(params = this.params) {
    return new Promise((resolve) => {
      let {geometry, material} = this.applyBridge({
        geometry: this.buildGeometry(params),
        material: loadMaterial(params.material)
      });

      this.native = new Mesh(
        geometry,
        material
      );

      resolve();
    });
  }

  buildGeometry(params = {}) {
    const GConstruct = params.buffer && !params.softbody ? DodecahedronBufferGeometry : DodecahedronGeometry;

    return new GConstruct(
      params.geometry.radius,
      params.geometry.detail
    );
  }

  set g_radius(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {radius: val}}));
  }

  get g_radius() {
    return this._native.geometry.parameters.radius;
  }

  set g_detail(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {detail: val}}));
  }

  get g_detail() {
    return this._native.geometry.parameters.detail;
  }

  clone() {
    return new Dodecahedron({build: false}).copy(this);
  }
}

export {
  Dodecahedron
};
