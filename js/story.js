class storypage {
    static DEC_TYPE_RESET   = 0;
    static DEC_TYPE_LINK    = 1;
    static DEC_TYPE_FATE    = 2;
    static DEC_TYPE_TRADE   = 3;
    static DEFAULT_PAGE     = "Skaldenfurt_Schmiede.xml";
    static HELTH_ZERO_PAGE  = "Orga_niederlage.xml";
    static HELTH_MAXVAL     = 10;

    //**********************************************************************************************************
    // constructor
    //**********************************************************************************************************
    constructor () {
        this.pageItems = [];
        this.ownItems = [];
        this.decissions = [];

        const page = nvmem_get("GameProgress",storypage.DEFAULT_PAGE);
        this.load(page);
    }

    //**********************************************************************************************************
    // load the page
    //**********************************************************************************************************
    load(page) {
        evt_hide_msgBox();
        this.page = page;
        $.ajax({
            url: './story/'+this.page,
            method: 'GET',
            dataType: 'xml'
        })
        .done((xml) => {
            this.title = $(xml).find('title').text();
            this.image = $(xml).find('image').text();
            this.sound = $(xml).find('sound').text();
            this.text  = $(xml).find('text').text();

            this.pageItems = [];
            $(xml).find("item").each((_, el) => { 
                const name = $(el).text();    
                var cnt = $(el).attr("cnt");
                const visibility = $(el).attr("visibility");
                const chance = $(el).attr("chance");
                cnt = nvmem_get(this.page+"."+name, cnt);
                if (cnt != 0) 
                    this.pageItems.push({name:name, cnt:cnt, visibility:visibility, chance:chance});
            });

            this.ownItems = [];
            const allCookies = nvmem_getAll();
            allCookies.forEach(el => {
                this.ownItems.push({name: el.name, cnt: Number(el.value)});
            });

            this.decissions = [];
            $(xml).find("decission").each((_, el) => { 
                const $el = $(el);

                const text = $.trim($(el).contents().first().text());
                const type = $(el).attr("type");
                const href = $(el).attr("href");
                const itemIn  = $(el).attr("itemIn");
                const inCnt   = $(el).attr("inCnt");
                const itemOut = $(el).attr("itemOut");
                const outCnt  = $(el).attr("outCnt");
                var results = [];
                $el.find("result").each((_, rs) => { 
                    const weight = $(rs).attr("weight");
                    const href = $(rs).attr("href");
                    const item = $(rs).attr("item");
                    const cnt  = $(rs).attr("cnt");
                    const text  = $(rs).text();
                    results.push({weight:weight, href:href, item:item, cnt:cnt, text:text});
                });
                this.decissions.push({text:text, type:type, href:href, 
                                    itemIn:itemIn, inCnt:inCnt, itemOut:itemOut, outCnt:outCnt, 
                                    results:results});
            });

            this.getHidden();
            this.setupPage();
            this.updateDecissions();
            this.updateSidebar();
            nvmem_set("GameProgress", this.page);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            alert("AJAX Fehler: " + textStatus + " / " + errorThrown);
            this.reset();
            this.load(storypage.DEFAULT_PAGE);
        });
    }

    //**********************************************************************************************************
    // get hidden items
    //**********************************************************************************************************
    getHidden() {
        var msgText = "";
        this.pageItems.forEach (el => {
            if (el.visibility != "hidden") {
                var rand = Math.floor(Math.random() * 100);
                if (rand < el.chance) {
                    const item = this.ownItems.find(i => i.name === el.name);
                    if (item == undefined)
                        this.ownItems.push({name: el.name, cnt: el.cnt});
                    else
                        item.cnt++;
                    nvmem_increas(el.name, el.cnt);
                    nvmem_set(this.page+"."+el.name, 0);

                    const gloItem = g_itemlist.find(i => i.name === el.name);
                    //if (msgText != "") msgText += "<br/>";
                    msgText = msgText + "<li>" +el.cnt + " x " + gloItem.hover_text + "</li>" ;
                } else {
                    // if not tagen by chance: delete
                    nvmem_set(this.page+"."+el.name, 0);
                }
            }
        });
        if (msgText != "") {
            if (this.pageItems.length == 1) {
                evt_show_msgBox("Gegenstand erhalten!", 
                    "Du hast folgenden Gegenstand erhalten:<ul>" + msgText + "</ul>Nutze ihn klug!");
            } else if (this.pageItems.length > 1) {
                evt_show_msgBox("Gegenstand erhalten!", 
                    "Du hast folgende Gegenstände erhalten:<ul>" + msgText + "</ul>Nutze sie klug!");
            }
        }
    }

    //**********************************************************************************************************
    // setup page
    //**********************************************************************************************************
    setupPage() {
        $('head > title').text(this.title);
        $('.image-container img:first').attr('src', this.image);
        const html = "<h2>" + this.title + "</h2>" + this.text;
        $('.story').html(html);
        $('.bottom-text').scrollTop(0);
        if ($('#sound_background source').attr('src') != this.sound)  {
            $('#sound_background source').attr('src', this.sound);
            document.getElementById('sound_background').load();
        }
    };

    //**********************************************************************************************************
    // update decissions
    //**********************************************************************************************************
    updateDecissions() {
        // Ziel-UL leeren
        const $ul = $(".decission ul");
        $ul.empty();

        $(this.decissions).each((_, el) => {
            var $a;
            const $li = $("<li>");

            switch (el.type) {
                case "fate":
                    //weight
                    var hundert = 0
                    for (var i=0; i<el.results.length; i++) {
                        hundert += Number(el.results[i].weight);
                    }
                    var rand = Math.floor(Math.random() * hundert);
                    for (var i=0, w=0; i<el.results.length; i++) {
                        w += Number(el.results[i].weight);
                        if (rand < w) {
                            rand = i;
                            break;
                        }
                    }
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_fate('" + el.results[rand].href + "'," + el.results[rand].text + ",'" + el.results[rand].item + "'," + el.results[rand].cnt + ")")
                        .text(el.text);
                    break;
                case "trade": {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_trade(event, '" + el.itemIn + "'," + el.inCnt + ",'" + el.itemOut + "'," + el.outCnt + ")")
                        .text(el.text);
                    const isPageCnt = this.pageItems.find(i => i.name === el.itemIn)?.cnt ?? 0;
                    const isOutCnt = this.ownItems.find(i => i.name === el.itemOut)?.cnt ?? 0;
                    if ((isPageCnt < el.inCnt) || (isOutCnt < el.outCnt))
                        $a.attr("class", "disabled-link");
                    break;
                }
                case "consume": {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_consume('" + el.itemIn + "'," + el.inCnt + ",'" + el.itemOut + "'," + el.outCnt + ")")
                        .text(el.text);
                    const isInCnt = this.ownItems.find(i => i.name === el.itemIn)?.cnt ?? 0;
                    const isOutCnt = this.ownItems.find(i => i.name === el.itemOut)?.cnt ?? 0;
                    if ((isInCnt < el.inCnt)/* || (isOutCnt < el.outCnt)*/)
                        $a.attr("class", "disabled-link");
                    break;
                }
                case "reset":
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_reset()")
                        .text(el.text);
                    break;
                    break;
                default:
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_load('" + el.href + "')")
                        .text(el.text);
                    break;
            }
            $li.append($a);
            $ul.append($li);
        });
    }

    //**********************************************************************************************************
    // update the sidebar
    //**********************************************************************************************************
    updateSidebar() {
        // Item images
        const sidebar_top = document.querySelector(".sidebar-top");
        sidebar_top.querySelectorAll(".sidebar-item-wrapper").forEach(el => el.remove());

        this.ownItems.forEach (el => {
            const gloItem = g_itemlist.find(i => i.name === el.name);

            if  ((gloItem  != undefined) && (el.cnt > 0)) {
                const number = document.createElement("span");
                number.classList.add("item-count");
                number.innerText = el.cnt;

                const img = document.createElement("img");
                img.src = gloItem.img;
                img.alt = gloItem.name;
                img.classList.add("sidebar-item");

                const link = document.createElement("a");
                link.setAttribute("onclick", gloItem.onclick);
                link.href = "#";
                link.appendChild(img);
                link.appendChild(number);

                const wrapper = document.createElement("div");
                wrapper.classList.add("sidebar-item-wrapper");
                wrapper.appendChild(link);

                sidebar_top.appendChild(wrapper);
                //sidebar_top.insertBefore(wrapper);
            }
        });

        // Helth images
        const sidebar_bottom = document.querySelector(".sidebar-bottom");
        sidebar_bottom.querySelectorAll(".helth").forEach(el => el.remove());
        const isHelth = this.ownItems.find(i => i.name === "helth")?.cnt ?? 0;
    
        for( var i=0; i<5 ; i++) {
            const img = document.createElement("img");
            if(i*2 < isHelth - 1) {
                    img.src = "./images/herz_voll.webp";
                    img.alt = "herz_voll";
                    img.classList.add("helth");
            } else if(i*2 > isHelth-1) {
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

    //**********************************************************************************************************
    // helth 0 action
    //**********************************************************************************************************
    helthZeroAction() {
        const helth = this.ownItems.find(i => i.name === "helth");
        const helthCnt = this.ownItems.find(i => i.name === "helth")?.cnt ?? 0;

        if (helthCnt == 0) {
            this.load(storypage.HELTH_ZERO_PAGE);
        } else if (helthCnt > storypage.HELTH_MAXVAL) {
            helth.cnt = storypage.HELTH_MAXVAL;
            nvmem_set("helth", helth.cnt);
        }
    }

    //**********************************************************************************************************
    // reset 
    //**********************************************************************************************************
    reset() {
        nvmem_deleteAll();
        nvmem_set("helth", 10);
        nvmem_set("GameProgress", storypage.DEFAULT_PAGE);
        this.load(storypage.DEFAULT_PAGE);
    }
}
