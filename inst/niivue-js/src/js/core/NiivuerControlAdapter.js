import { CONSTANTS } from './Constants.js';
import { EnhancedGUI } from './EnhancedGUI.js';
import { EventDispatcher } from './EventDispatcher.js';

/**
 * NiivuerControlCenter.gui is an instance of EnhancedGUI
 * so that .gui can be replaced at anytime, without replacing
 * the canvas
 */
class NiivuerControlAdapter extends EventDispatcher {

  constructor( app ){

    super();

    this.app = app;
    this.userData = {};

    this.guiClosed = false;
    this.resetGUI();
  }

  get width () {
    return CONSTANTS.CONTROLLER.WIDTH;
  }

  _onGUIExpanded = ( event ) => {
    // open a folder
    if( event.folderPath !== "" ) { return; }

    // root folder is expanded
    this.guiClosed = false;

    this.dispatchEvent({
      type      : "NiivuerControlAdapter.onExpanded",
      immediate : true
    })
  }
  _onGUICollapsed = ( event ) => {
    if( event.folderPath !== "" ) { return; }
    this.guiClosed = true;
    this.dispatchEvent({
      type      : "NiivuerControlAdapter.onCollapsed",
      immediate : true
    })
  }

  resetGUI() {

    // remove the old elements
    if( this.gui ) {
      this.gui.removeEventListener( "open", this._onGUIExpanded );
      this.gui.removeEventListener( "close", this._onGUICollapsed );
      this.gui.dispose();
    }

    // FIXME: reset HTML (?)
    this.app.$controllerWrapper.innerHTML = ""

    this.gui = new EnhancedGUI({
      autoPlace: false,
      title : "Niivuer Control Panel",
      // logoElement : this.$brandWrapper
    });

    this.gui.addEventListener( "open", this._onGUIExpanded );
    this.gui.addEventListener( "close", this._onGUICollapsed );

    this.gui.domElement.style.width = `${this.width}px`;
    this.app.$controllerWrapper.appendChild( this.gui.domElement );

    // finish registering options
    this._registerDefaultControllers();

    // GUI is initialized opened
    this.gui.open();

  }

  update() {
    // for animation (time-series)
  }

  broadcast({ data, priority = "deferred", broadcastController = "auto" } = {}){

    if( typeof data === "object" ) {
      Object.assign( this.userData , data );
      this.dispatchEvent({
        type : "viewerApp.controller.broadcastData",
        data : data,
        priority : priority
      });
      if( broadcastController !== true) { return; }
    }
    this.dispatchEvent({
      type : "viewerApp.controller.change",
      priority : priority
    });
  }

  getController( name, folderName, explicit = false ) {
    return this.gui.getController( name, folderName, explicit );
  }


  // ---- Default --------------------------------------------------------------
  _registerDefaultControllers() {

    const folderName = "Default";

    this.gui.addController(
      "Background Color",
      this.app.backgroundColor,
      { isColor: true, folderName: folderName }
    ).onChange(v => {
      this.app.backgroundColor = v;
      this.broadcast();
    });

    const sliceTypes = ["Axial", "Coronal", "Sagittal", "All", "3D-only"];
    this.gui.addController(
      "Slice Types",
      sliceTypes[this.app.sliceType || 4],
      { args: sliceTypes, folderName: folderName }
    ).onChange(v => {
      const st = sliceTypes.indexOf(v);
      this.app.sliceType = st < 0 ? 4 : st;
      this.broadcast();
    });

  }

}

export { NiivuerControlAdapter };
