import { Niivue, DEFAULT_OPTIONS } from '@niivue/niivue';
import { NiivuerControlAdapter } from './NiivuerControlAdapter.js';
import { requestAnimationFrame } from './requestAnimationFrame.js';
import { hexToRGB, rgbToHex } from '../utils/hexToRGB.js';

/**
 * NiivueApp
 *  - object [Niivue]
 *  - controlPanel [NiivuerControlAdapter]
 */
class NiivuerApp {

  constructor( parameters, $container ) {

    this.drivers = [];

    // Initialize HTML elements
    this.$container = $container;

    // Use JavaScript for now, will be replaced by [s]css
    this.$wrapper = document.createElement("div");
    this.$wrapper.style.position = "relative";
    this.$wrapper.style.width = "100%";
    this.$wrapper.style.height = `${this.height}px`;

    this.$viewerWrapper = document.createElement("div");
    this.$viewerWrapper.style.height = "100%";

    this.$viewerCanvas = document.createElement("canvas");
    this.$viewerWrapper.appendChild( this.$viewerCanvas );

    this.$controllerWrapper = document.createElement("div");
    this.$controllerWrapper.style.position = "absolute";
    this.$controllerWrapper.style.maxHeight = "100%";
    this.$controllerWrapper.style.overflowY = "scroll";
    this.$controllerWrapper.style.overflowX = "hidden";
    this.$controllerWrapper.style.right = "0";
    this.$controllerWrapper.style.top = "0";

    // construct `object`
    this.object = new Niivue( parameters );
    this.object.attachToCanvas( this.$viewerCanvas );

    // controlPanel
    this.controlPanel = new NiivuerControlAdapter( this );

    // bind events
    this.controlPanel.addEventListener(
      "NiivuerControlAdapter.onExpanded",
      ( event ) => {
        console.log("ex")
        this.updateSize();
      }
    );
    this.controlPanel.addEventListener(
      "NiivuerControlAdapter.onCollapsed",
      ( event ) => {
        console.log("co")
        this.updateSize();
      }
    );

    // Add GUI components from bottom-up
    this.$wrapper.appendChild( this.$controllerWrapper );
    this.$wrapper.appendChild( this.$viewerWrapper );
    this.$container.appendChild( this.$wrapper );


    this.updateSize();
    this.backgroundColor = this.object.opts.backColor;

    // start animation
    this.animate();

  }

  get width () {
    return this.$container.offsetWidth;
  }
  get height () {
    return this.$container.offsetHeight;
  }

  get viewerWidth () {
    // hard-code
    if( this.controlPanel.guiClosed ) {
      return this.width;
    }
    const w = this.width - this.controlPanel.width;
    return w > 100 ? w : 100;
  }

  updateSize() {
    this.$wrapper.style.height = `${this.height}px`;

    if( this.controlPanel.guiClosed ) {
      this.$viewerWrapper.style.width = "100%";
    } else {
      this.$viewerWrapper.style.width = `calc( 100% - ${this.controlPanel.width}px )`;
    }

    this.needsUpdate = true;
  }

  removeAll() {
    // remove all volumes, surfaces, ...
  }

  dispose() {
    // remove all and freeup memory
    this.removeAll();

    this._disposed = true;
  }

  animate(){

    if( this._disposed ){ return; }

    requestAnimationFrame( this.animate.bind(this) );

    if( !this.needsUpdate ) { return; }
    this.needsUpdate = undefined;

    if(
      this.$viewerCanvas.clientHeight < 10 ||
      this.$viewerCanvas.clientWidth < 10
    ) {
      // no rendering when canvas is too small
      return;
    }

    this.controlPanel.update();

    this.object.drawScene();

	}

  renderValue(x) {
    if( typeof x !== "object" || x === null ) { return; }

    const appSettings = x.appSettings;
    if( appSettings.removeAll ) {
      this.removeAll();
    }

    if( x.volumeList ) {
      this.object.loadVolumes( x.volumeList );
    }

    if( x.meshList ) {
      this.object.loadMeshes( x.meshList );
    }

    if( typeof x.viewerSettings === "object" && x.viewerSettings !== null ) {
      for( let key in x.viewerSettings ) {
        const val = x.viewerSettings[ key ];
        const fun = this.object[ key ];
        if ( typeof fun === "function" ) {
          fun.bind( this.object )( val );
        }
      }
    }
  }

  addDriver( cls ) {
    const driver = new cls(this);
    this.drivers.push(driver);
  }











  get backgroundColor() {
    return rgbToHex(...this.object.opts.backColor);
  }
  set backgroundColor( color ) {
    if( !color ) {
      color = this.object.opts.backColor;
    }
    if ( typeof color === "string" ) {
      color = hexToRGB(color);
    } else if (Array.isArray(color)) {
      color = {
        r: color[0] ?? 0,
        g: color[1] ?? 0,
        b: color[2] ?? 0,
      }
    }
    this.object.opts.backColor[0] = color.r;
    this.object.opts.backColor[1] = color.g;
    this.object.opts.backColor[2] = color.b;
    this.needsUpdate = true;

    this.$wrapper.style.backgroundColor = `rgb(${color.r * 100}%, ${color.g * 100}%, ${color.b * 100}%)`;
  }

  get sliceType() {
    return this.object.opts.sliceType;
  }
  set sliceType( st ) {
    this.object.opts.sliceType = st;
    this.needsUpdate = true;
  }
}


export { NiivuerApp };
