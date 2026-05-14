function showOverlay(content = "") {
    const overlay = document.getElementById("fate-overlay");
    const box = overlay.querySelector(".fate-overlay-content");

//    box.innerHTML = content;
    overlay.style.display = "flex";
    
    $(".fate-overlay-content").animate({height: "0px", width: "0px"});
    $(".fate-overlay-content").animate({height: "90%", width: "90%"});
}

function hideOverlay() {
    document.getElementById("fate-overlay").style.display = "none";
}

//document.getElementById("fate-overlay").addEventListener("click", function(e) {
//    if (e.target === this) hideOverlay();
//});