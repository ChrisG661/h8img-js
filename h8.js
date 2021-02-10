/******************************************************************************/
/* button_area gps_button.click                                               */
/******************************************************************************/
$("#gps_button").on("click", function () {
  var $this = $(this);

  $("#lock_window").addClass("show");
  $this.toggleClass("gps_on");

  if ($this.hasClass("gps_on")) {
    $this.addClass("gps_loading");

    navigator.geolocation.getCurrentPosition(function (pPosition) {
      var $viewArea = $("#view_area");

      $viewArea.k2goTileViewer("move", { degrees: { left: pPosition.coords.longitude, top: pPosition.coords.latitude } }, 500, function () {
        $this.data("coords", pPosition.coords);
        $this.data("entity", $("<div id='gps_pin'></div>").css({ width: "48px", height: "48px", backgroundSize: "48px 48px" }));
        $viewArea.k2goTileViewer("addEntity", { element: $this.data("entity"), center: { degrees: { left: pPosition.coords.longitude, top: pPosition.coords.latitude } } });

        $this.removeClass("gps_loading");
        $("#lock_window").removeClass("show");
        $(window).trigger("unload");

        $.nictSTARSLogger.info("[image] gps (on)", { action: "[image] gps (on)", show: $Env.showDate.toISOString(), level: $Env.image[$Env.showImage].centerInfo.scale, left: parseFloat($("#view_area .k2go-tile-viewer-main").css("backgroundPosition").split(" ")[0]), top: parseFloat($("#view_area .k2go-tile-viewer-main").css("backgroundPosition").split(" ")[1]), url: $.himawari8Image.getViewUrl() });
      });
    },
      function (pError) {
        $this.removeClass("gps_on");
        $this.removeClass("gps_loading");
        $("#lock_window").removeClass("show");

        $.himawari8Image.openDialog("gps_error", $("<div></div>"), $("<div error_code='" + pError.code + "'></div>"), 100);
      },
      {
        timeout: 10000
      });
  }
  else {
    setTimeout(function () {
      $("#view_area").k2goTileViewer("deleteEntity", $this.data("entity"));
      $("#lock_window").removeClass("show");
      $this.removeData("coords");
      $this.removeData("entity");

      $.nictSTARSLogger.info("[image] gps (off)", { action: "[image] gps (off)" });
    }, 500);
  }
});