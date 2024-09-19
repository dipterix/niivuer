app <- shiny::shinyApp(
  ui = shiny::fluidPage(
    shiny::titlePanel("Basic usage"),
    shiny::sidebarLayout(
      sidebarPanel = shiny::sidebarPanel(
        width = 3L,
        shiny::verbatimTextOutput("text")
      ),
      mainPanel = shiny::mainPanel(
        width = 9L,
        niivuer::niivuerOutput("out", height = "calc( 100vh - 64px )")
      )
    )
  ),
  server = function(input, output, session) {
    output$out <- niivuer::renderNiivuer({
      niivuer::niivue()
    })
    output$text <- shiny::renderPrint({
      controllers <- input$out_controllers
      if(!length(controllers)) {
        cat("Waiting for controller input")
      } else {
        str(controllers)
      }
    })
  },
  options = list(
    launch.browser = TRUE
  )
)
print(app)
