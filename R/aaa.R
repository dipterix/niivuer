#' @import htmlwidgets
NULL


save_selfcontained <- function(widget)  {

  temp_dir <- tempfile()
  dir.create(temp_dir)
  temp_file <- file.path(temp_dir,"widget.html")

  htmlwidgets::saveWidget(widget, file = temp_file, selfcontained = FALSE)

  # read not self-contained html
  html_text <- readLines(temp_file, warn = FALSE)

  # convert <script src=*> to <script>js file contents</script>
  js_lines <- which(grepl(
    x = html_text,
    pattern = '(src=.*js)'
  ))

  # convert link[rel=stylesheet] to <style>css file contents</style>
  css_lines <- which(grepl(
    x = html_text,
    pattern = '(href=.*css)'
  ))

  # perform self-contained conversion/replacement of JS
  if(length(js_lines) > 0) {
    html_text[js_lines] <- lapply(js_lines, function(js_line) {
      js_file <- sub(x=html_text[js_line], pattern='.*src=[":\'](.*\\.js).*', replacement="\\1")
      js_content <- paste0(
        "<script>",
        paste0(readLines(file.path(temp_dir,js_file), warn = FALSE), collapse="\n"),
        "</script>",
        collapse="\n"
      )
    })
  }

  # perform self-contained conversion/replacement of JS
  if(length(css_lines) > 0) {
    html_text[css_lines] <- lapply(css_lines, function(css_line) {
      css_file <- sub(x=html_text[css_line], pattern='.*href=[":\'](.*\\.css).*', replacement="\\1")
      css_content <- paste0(
        "<style>",
        paste0(readLines(file.path(temp_dir,css_file), warn = FALSE), collapse="\n"),
        "</style>",
        collapse="\n"
      )
    })
  }

  # save self-contained html
  write(paste0(html_text,collapse="\n"), file=file.path(temp_dir,"index.html"))

  return(file.path(temp_dir,"index.html"))
}
