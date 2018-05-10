// GRAB ARTICLES AS A JSON
$.getJSON("/articles", function(data) {
    // FOR EACH ONE
    for (var i = 0; i < data.length; i++) {
        // DISPLAY INFO
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "<br />" + data[i].summary + "</p>");
    }
});

// WHEN A P TAG IS CLICKED
$(document).on("click", "p", function(){
    // EMPTY NOTES FROM NOTE SECTION
    $("#notes").empty();
    // SAVE ID FROM P TAG
    var thisId = $(this).attr("data-id");

    // AJAX CALL FOR ARTICLE
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    // ADD NOTE INFORMATION TO PAGE
    .then(function(data){
        console.log(data);
        // ARTICLE TITLE
        $("#notes").append("<h2>" + data.title + "</h2>");
        // NEW TITLE
        $("#notes").append("<input id='titleinput' name='title' >");
        // NEW NOTE TO BODY
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A BUTTON TO SUBMIT NEW NOTE
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // IF A NOTE EXISTS IN THE ARTICLE
        if (data.note) {
            // PLACE NOTE TITLE IN TITLE INPUT
            $("#titleinput").val(data.note.title);
            // PLACE BODY IN BODY AREA
            $("#bodyinput").val(data.note.body);
        }
    });
});

