function hiddenItem_clear() {
    const items = document.querySelector("#hiddenItems");
    items.querySelectorAll(".hiddenItem").forEach(item => item.remove()); 
}

function hiddenItem_append(name, val) {
    $div = $("<div>").attr("cnt", val)
                   .attr("class", "hiddenItem")
                   .text(name);
    $("#hiddenItems").append($div);
}

function hiddenItem_set(name, val) {
    const items = document.querySelector("#hiddenItems");
    items.querySelectorAll(".hiddenItem").forEach(item => {
        const text = $(item).text();
        if (text == name) {
            $(item).attr("cnt",val);
        }
    });
}

function hiddenItem_get(name) {
    var retval = undefined;
    const items = document.querySelector("#hiddenItems");
    items.querySelectorAll(".hiddenItem").forEach(item => {
        const text = $(item).text();
        if (text == name) {
            retval = $(item).attr("cnt");
        }
    });

    return retval;
}

function hiddenItem_inc(name, val) {
    var act = hiddenItem_get(name);
    if (act != undefined) {
        hiddenItem_set(name, Number(act) + Number(val));
    } else {
        hiddenItem_append(name, Number(val));
    }
}