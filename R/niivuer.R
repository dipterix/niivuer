#' 'NiiVue' for R
#'
#' Creates a widget that bridges 'NiiVue', a powerful 3D brain viewer and R-shiny
#'
#' @param volume_list list of items, each item is a volume file
#' @param mesh_list list of items, each item is a mesh file
#' @param viewer_settings initial call to set viewer status
#' @param controller_settings initial controller settings
#' @param ... application settings
#' @param width,height widget size
#' @param elementId passed to \code{\link[htmlwidgets]{createWidget}}.
#' @returns A \code{'niivuer'} widget
#'
#' @examples
#'
#' if( interactive() ) {
#'
#'   niivuer()
#'
#' }
#'
#'
#' @export
niivuer <- function(
    volume_list = list(
      list(
        url= "https://niivue.github.io/niivue/images/mni152.nii.gz",
        colormap= "gray"
      ),
      list(
        url= "https://niivue.github.io/niivue/images/hippo.nii.gz",
        colormap= "red"
      )
    ),
    mesh_list = list(
      list(
        url = "https://niivue.github.io/niivue/images/BrainMesh_ICBM152.lh.mz3"
      )
    ),
    viewer_settings = list(
      setMultiplanarLayout = 2,
      setSliceMM = TRUE,
      setSliceType = 4
    ),
    controller_settings = list(
    ),
    ...,
    width = NULL, height = NULL, elementId = NULL) {

  volume_list <- unname(as.list(volume_list))
  mesh_list <- unname(as.list(mesh_list))


  x = list(
    volumeList = volume_list,
    meshList = mesh_list,
    viewerSettings = as.list(viewer_settings),
    controllerSettings = as.list(controller_settings),
    # generate app level
    appSettings = list(...)
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'niivuer',
    x,
    width = width,
    height = height,
    package = 'niivuer',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(
      padding = 0,
      defaultWidth = "100%",
      viewer.defaultHeight = "100vh",
      browser.defaultHeight = "100vh",
      browser.fill = TRUE,
      fill = TRUE
    )
  )
}

#' Shiny bindings for 'NiiVue'
#'
#' Output and render functions for using niivuer within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'500px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a niivuer
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name niivuer-shiny
#'
#' @export
niivuerOutput <- function(outputId, width = '100%', height = '500px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'niivuer', width, height, package = 'niivuer')
}

#' @rdname niivuer-shiny
#' @export
renderNiivuer <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, niivuerOutput, env, quoted = TRUE)
}
