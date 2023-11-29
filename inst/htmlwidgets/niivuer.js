HTMLWidgets.widget({

  name: 'niivuer',

  type: 'output',

  factory: function(el, width, height) {

    // generate a canvas and appendChild to el
    const canvas = document.createElement("canvas");
    el.appendChild( canvas );
    let niivue;

    return {

      renderValue: function(x) {

        if( niivue === undefined ) {
          niivue = new NiiVue({crosshairColor: [0,1,0,0.5], textHeight: 0.5});
          niivue.attachToCanvas(canvas);
        }

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
