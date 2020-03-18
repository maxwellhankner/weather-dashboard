// When the html document had loaded, fun the function within
$(document).ready(function() {
  // Select search button and add an event listener on click
  $("#search-button").on("click", function() {
    // set searchValue to the text that is in the text field
    var searchValue = $("#search-value").val();
    // clear input box
    $("#search-value").val("");
    // Run searchWeather function with the searchValue as the only parameter
    searchWeather(searchValue);
  });

  // Select clear button and add an event listener on click
  $("#clear-button").on("click", function() {
    // Clear the local storage
    localStorage.removeItem('history');
    // Empty the history section
    $(".history").empty();
    // Empty the today secrtion
    $("#today").empty();
    // Empty the forecast section
    $("#forecast").empty();
  })

  // Add an event listener on the history list and run the function when a list element is clicked
  // Also, keep the list elements updated with the "li" parameter
  $(".history").on("click", "li", function() {
    // Run the searchWeather function with the history li text value
    searchWeather($(this).text());
  });

  // Create a makeRow function that takes text as the only parameter
  function makeRow(text) {
    // Create an li element and add classes and set the inner text to be what was given in the text parameter
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // Add the element to the history list
    $(".history").append(li);
  }

  // Created searchWeather function that takes a string location as the only parameter
  function searchWeather(searchValue) {
    // Make an ajax call
    $.ajax({
      // Of type GET
      type: "GET",
      // Build the api url
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      dataType: "json",
      // If successful, run the following function with the data received
      success: function(data) {
        // If the location does not exist in the history
        if (history.indexOf(searchValue) === -1) {
          // Add it to history
          history.push(searchValue);
          // Update history in local storage
          window.localStorage.setItem("history", JSON.stringify(history));
          // And make a new row for the location
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // Create html content for current weather
        // Create a title header with the location and the current date
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // Create a div card
        var card = $("<div>").addClass("card");
        // Create a wind paragraph with the current wind speed
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // Create a humidity paragraph with the current humidity
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // Create a temp paragraph with the current temperature
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // Create a card body
        var cardBody = $("<div>").addClass("card-body");
        // Create an image tag with the current weather icon
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // Merge and add to page
        // Add the weather icon to the header
        title.append(img);
        // Add the title, temperatur, humidity, and wind to the card body
        cardBody.append(title, temp, humid, wind);
        // Add the card body to the card
        card.append(cardBody);
        // Add the card to the today section
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  // Created getForcast function that takes a location as the only paramater
  function getForecast(searchValue) {
    // Make an ajax request
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      dataType: "json",
      // If it is successful, run the following function with the given data
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            // Create a col div
            var col = $("<div>").addClass("col-md-2");
            // Create a card div
            var card = $("<div>").addClass("card bg-primary text-white");
            // Create a car body div
            var body = $("<div>").addClass("card-body p-2");
            // Create an h5 title and set the text to be the desired date
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            // Create an image tage for the weather icon
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            // Create a paragraph tag and put that day's temp in the text
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // Create a paragraph tag and put that day's humidity in the text
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  // Create a getUVIndex function that takes a lattitude and longitude as the parameters
  function getUVIndex(lat, lon) {
    // Make an ajax call
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      // If the request is successful, run the following function
      success: function(data) {
        // Create a uv paragraph tag and set the text
        var uv = $("<p>").text("UV Index: ");
        // Create a button span tag and and set the text to the responses value
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        // Add the span button to the paragraph and add both to the today section card body
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any, and set that to an array
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  // Run the search weather function on the last element of the history array
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  // Make a row for each element in the histpry array
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
