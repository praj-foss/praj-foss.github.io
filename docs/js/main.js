function gotoPage(element) {
    location.href = element.dataset.href;
}

function gotoTop() {
    window.scroll({
        top: 0, 
        left: 0, 
        behavior: "smooth"
    });
}

function toggleButton(id) {
    const button = document.getElementById(id);
    button.classList.toggle("disabled");
    button.disabled = !button.disabled;
}

function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("hidden");
    document.body.classList.toggle("noscroll");
    document.getElementById("icon-menu").classList.toggle("hidden");
    document.getElementById("icon-close").classList.toggle("hidden");
    toggleButton("button-share");
    toggleButton("button-top");
}

function checkSidebar() {
    if (document.body.classList.contains("noscroll")) {
        toggleMenu();
    }
    const sidebarClasses = document.getElementById("sidebar").classList;
    if (window.innerWidth  >= 750) {        
        sidebarClasses.remove("hidden");
    } else {
        sidebarClasses.add("hidden");
    }
}

window.onresize = checkSidebar;