HTMLWidgets.widget({

  name: 'niivuer',

  type: 'output',

  factory: function(el, width, height) {

    let app;


    return {

      renderValue: function(x) {

        if( app === undefined ) {
          app = new window.Niivuer.NiivuerApp({
            sliceType: 4,
            multiplanarLayout: 2,
          }, el);
          window.app = app;

          app.addDriver( window.Niivuer.RShinyDriver );
        }
        app.renderValue(x);
        window.x = x;

      },

      resize: function(width, height) {

        if( app ) {

          app.updateSize();

        }

      }

    };
  }
});
