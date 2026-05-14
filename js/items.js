
const g_itemlist = [
  { name: "itm_brief",     img: "./images/item_brief.webp",     hover_text: "Brief",       onclick: ""},
  { name: "itm_geld",      img: "./images/item_geld.webp",      hover_text: "Rautlinge",   onclick: ""},
  { name: "itm_proviant",  img: "./images/item_proviant.webp",  hover_text: "Proviant",    onclick: ""},
  { name: "itm_schwert",   img: "./images/item_schwert.webp",   hover_text: "Schwert",     onclick: ""},
  { name: "itm_pilz",      img: "./images/item_pilz.webp",      hover_text: "Pilz",        onclick: ""},
  { name: "itm_heiltrunk", img: "./images/item_heiltrunk.webp", hover_text: "Heiltrunk",   onclick: "evt_consume('helth', -4, 'itm_heiltrunk', 1)"},
  { name: "itm_uhr",       img: "./images/item_uhr.webp",       hover_text: "Uhr",         onclick: ""},
  { name: "itm_kraeuter",  img: "./images/item_kraeuter.webp",  hover_text: "Heilkräuter", onclick: "evt_consume('helth', -2, 'itm_kraeuter', 1)"},
];

/*
function updateSidebar() {
    // Bild dynamisch einfügen
    const sidebar_top = document.querySelector(".sidebar-top");
    sidebar_top.querySelectorAll(".sidebar-item-wrapper").forEach(el => el.remove());

    g_itemlist.forEach(item => {
        var anz = nvmem_get(item.name,"");
        if (anz > 0) {
            const number = document.createElement("span");
            number.classList.add("sidebar-item-count");
            number.innerText = anz;

            const img = document.createElement("img");
            img.src = item.img;
            img.alt = item.name;
            img.classList.add("sidebar-item");

            const wrapper = document.createElement("div");
            wrapper.classList.add("sidebar-item-wrapper");
            wrapper.appendChild(img);
            wrapper.appendChild(number);

            sidebar_top.appendChild(wrapper);
        }
    });

    // Bild dynamisch einfügen
    const sidebar_bottom = document.querySelector(".sidebar-bottom");
    sidebar_bottom.querySelectorAll(".helth").forEach(el => el.remove());
    const helth = nvmem_get("helth","");
    
    for( var i=0; i<5 ; i++) {
        const img = document.createElement("img");
        if(i*2 < helth - 1) {
                img.src = "./images/herz_voll.webp";
                img.alt = "herz_voll";
                img.classList.add("helth");
        } else if(i*2 > helth-1) {
                img.src = "./images/herz_leer.webp";
                img.alt = "herz_voll";
                img.classList.add("helth");
        } else  {
                img.src = "./images/herz_halb.webp";
                img.alt = "herz_leer";
                img.classList.add("helth");
        }
        sidebar_bottom.appendChild(img);
    }
}

function items_have(name) {
    const cnt = nvmem_get(name,"");
    if (Number(cnt) != 0) {
        return true;
    } else {
        return false;
    }

}

*/
function items_set_default() {
    nvmem_deleteAll();
    nvmem_set("GameProgress", "Skaldenfurt_Schmiede.xml");
    nvmem_set("helth", 10);
}

