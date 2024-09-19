class RShinyDriver {

  constructor( app ) {

    this.app = app;

    this.isRShinyDriver = true;

    this.$container = this.app.$container;
    this.containerID = this.app.$container.id;
    this.shinyCallbackID = `${ this.containerID }__shiny`;
    this.controllerData = {};

    // check if shiny is valid
    if( typeof window.Shiny !== "object" || window.Shiny === null ||
        typeof window.Shiny.onInputChange !== "function" ) {
      // this is not shiny, just return
      this._shiny = undefined;
      return;
    }

    this._shiny = window.Shiny;

    // register events
    this.$container.addEventListener( "viewerApp.mouse.click", this._onClicked );
    this.$container.addEventListener( "viewerApp.mainCamera.updated", this._onMainCameraUpdated );
    this.$container.addEventListener( "viewerApp.state.updated" , this._onCanvasStateChanged );

    // Bind shiny
    this._shiny.addCustomMessageHandler(`niivuer-RtoJS-${this.containerID}`, (data) => {

      if( typeof data.name !== "string" || data.name.length === 0 ) { return; }

      switch (data.name) {
        case 'background':
          this.driveBackground( data.value );
          break;
        default:
          // code
          console.warn(`Unknown Shiny command type: [${data.name}].`);
      }

    });


    this.app.controlPanel.addEventListener(
      "viewerApp.controller.change" , this._onControllersUpdated )
    this.app.controlPanel.addEventListener(
      "viewerApp.controller.broadcastData" , this._onControllersBroadcast );

    this.enabled = true;
  }

  dispose() {
    if( this.app.controlPanel ) {
      try {
        // no need to remove this but just in case...
        this.app.controlPanel.removeEventListener( "viewerApp.controller.change" , this._onControllersUpdated );
        this.app.controlPanel.removeEventListener( "viewerApp.controller.broadcastData" , this._onControllersBroadcast );
      } catch (e) {}
    }
    // remove listeners
    this.$container.removeEventListener( "viewerApp.mouse.click", this._onClicked );
    this.$container.removeEventListener( "viewerApp.mainCamera.updated", this._onMainCameraUpdated );
    this.$container.removeEventListener( "viewerApp.state.updated" , this._onCanvasStateChanged );
  }

  _onControllersUpdated = async ( event ) => {
    const priority = event.priority || "deferred" ;
    const data = {};
    //Object.assign(this.controllerData, this.app.controlPanel.userData);
    this.app.controlPanel.gui.controllersRecursive()
      .forEach((controller) => {
        if( !controller.isfake ) {
          const value = controller.getValue();
          if( typeof value !== 'function' ) {
            data[ controller._name ] = value;
          }
        }
      });
    this.dispatchToShiny('controllers', data, priority);
  }

  _onControllersBroadcast = async ( event ) => {
    if( typeof event === "object" && typeof event.data === "object" ) {
      const priority = event.priority || "deferred" ;
      for( let key in event.data ) {
        this.dispatchToShiny(key, event.data[ key ], priority);
      }
    }
  }

  _onClicked = async ( event ) => {
    // TODO
    return;
    const clickEvent = event.detail;
    if( this.canvas.activated ) {

      const data = this.getObjectChosen();
      if( !data ) { return; }


      if( clickEvent.detail > 1 ) {
        this.dispatchToShiny('mouse_dblclicked', data, 'event');
      } else {
        this.dispatchToShiny('mouse_clicked', data, 'event');
      }
    }
  }

  _onMainCameraUpdated = async () => {
    // TODO:
    return;
    this.debugVerbose(`Camera updated`);
    // get camera data
    const cameraState = this.canvas.mainCamera.getState();

    this.dispatchToShiny(
      'main_camera',
      {
        target    : cameraState.target,
        position  : cameraState.position,
        up        : cameraState.up,
        zoom      : cameraState.zoom
      }
    );
  }

  _onCanvasStateChanged = async () => {
    // TODO:
    return;
    const data = Object.fromEntries( this.canvas.state_data );
    for(let k in data) {
      const v = data[k];
      if( v && typeof v === "object" && v.isThreeBrainObject ) {
        delete data[k];
      }
    }
    this.dispatchToShiny('canvas_state', data);
  }

  dispatchToShiny( name , value , priority = "deferred" ) {

    if( !this.enabled ){ return; }

    this.debugVerbose(`Sending data [${name}] to shiny app...`)
    // make sure shiny exists and is connected
    if( !this._shiny || !this._shiny.shinyapp.$socket ) { return; }
    const inputId = `${ this.containerID }_${ name }`;
    console.debug(`Dispatching to shiny with priority ${ priority }: ${ name }`);
    this._shiny.setInputValue(inputId, value, { priority : priority });
  }

  debugVerbose = ( message ) => {
    if( this.debug ) {
      console.debug( message );
    }
  };

  driveBackground( color ) {
    const controller = this.app.controlPanel.getController('Background Color');
    controller.setValue( color );
  }


}


export { RShinyDriver };
