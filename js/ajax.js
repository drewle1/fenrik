function ajxLoadFile(file)  {
    // load new file
    $.ajax({
        url: './story/'+file,
        method: 'GET',
        dataType: 'xml'
    })
    .done(function (xml) {
        var title = $(xml).find('title').text();
        var image = $(xml).find('image').text();
        var sound = $(xml).find('sound').text();
        var text = $(xml).find('text').text();

        $('head > title').text(title);
        $('.image-container img:first').attr('src', image);
        const html = "<h2>" + title + "</h2>" + text;
        $('.story').html(html);
        $('#sound_background source').attr('src', sound);
        document.getElementById('sound_background').load();
        updateItems(xml, file);
        updateDecissions(xml);
        updateSidebar();
        nvmem_set("GameProgress", file);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        alert("AJAX Fehler: " + textStatus + " / " + errorThrown);
        items_set_default();
        ajxLoadFile("Skaldenfurt_Schmiede.xml");
    });
}

function updateItems(xml, file) {
    const lastFrame = nvmem_get("GameProgress", "");

    // Don't update if file was reenterd (F5)
//    if( lastFrame != file) {
        $(xml).find("item").each(function () {
            const text = $(this).text();
            const inc = $(this).attr("inc");
            const cnt = $(this).attr("cnt");
            const visibility = $(this).attr("visibility");
            if (visibility == "hidden") {
                hiddenItem_append(text, Number(cnt));
            } else {
                let val = Number(nvmem_get(text,"")) + Number(inc); 
                if (val < 0)  {
                    val = 0; 
                }
                nvmem_set(text, val);
            }
        });
//    }
}

function updateDecissions(xml) {
    // Ziel-UL leeren
    const $ul = $(".decission ul");
    $ul.empty();

    // Alle <decission>-Elemente durchgehen
    $(xml).find("decission").each(function () {
        const text = $.trim($(this).contents().first().text()); //$(this).text();
        const type = $(this).attr("type");
        var $a;

        // Neues <li> erzeugen
        const $li = $("<li>");
        switch (type) {
            case "fate":  {
                const result1 = $(this).find("result")
                const rand = Math.floor(Math.random() * result1.length);
                const result = $(result1[rand]);
                const href = result.attr("href");
                const item = "'"+result.attr("item")+"'";
                const cnt = result.attr("cnt");
                const resultText = result.text();
                $a = $("<a>")
                    .attr("href", "#")
                    .attr("onclick", "evt_fate('" + href + "'," + resultText + "," + item + "," + cnt + ")")
                    .text(text);
            }   
            break;
            case "trade": {
                const href = $(this).attr("href");
                const itemIn = $(this).attr("itemIn");
                const inCnt = Number($(this).attr("inCnt"));
                const itemOut = $(this).attr("itemOut");
                const outCnt = Number($(this).attr("outCnt"));
                const hiddenCnt = Number(hiddenItem_get(itemIn));
                const cookieCnt = Number(nvmem_get(itemOut,""));
                
                if ((hiddenCnt >= inCnt) && (cookieCnt >= outCnt))  {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_trade(event, '" + itemIn + "'," + inCnt + ",'" + itemOut + "'," + outCnt + ")")
                        .text(text);
                } else {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_trade(event, '" + itemIn + "'," + inCnt + ",'" + itemOut + "'," + outCnt + ")")
                        .attr("class", "disabled-link")
                        .text(text);
                }
            }   
            break;
            default: {
                const href = $(this).attr("href");
                const required = $(this).attr("required");
                const reqCnt = $(this).attr("reqCnt");
                var  allowed = true;

                if (required != undefined) {
                    const cnt = nvmem_get(required,"");
                    if (Number(cnt) < Number(reqCnt)) {
                        allowed = false;
                    }
                }
                if (allowed) {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_load('" + href + "')")
                        .text(text);
                } else {
                    $a = $("<a>")
                        .attr("href", "#")
                        .attr("onclick", "evt_load('" + href + "')")
                        .attr("class", "disabled-link")
                        .text(text);
                }
            }   
            break;
        };

        $li.append($a);
        $ul.append($li);
    });
}
