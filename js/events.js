var story;

//**********************************************************************************************************
// page loaded
//**********************************************************************************************************
$(document).ready(function() {
    story = new storypage();

//    var progress = nvmem_get("GameProgress","");
//    story.load(progress);

    //var progress = nvmem_get("GameProgress","");
    //evt_load(progress);
})

//**********************************************************************************************************
// load page and update items
//**********************************************************************************************************
function evt_loadall(file, item_in, inCnt, item_out, outCnt)  {
  var exchangeOk = true;

  if(file != "this") {
    story.load(file);
  }

  // Handle items which shall be removed on click
  if( (item_out !== undefined) && (outCnt!== undefined)) {
      let val = Number(nvmem_get(item_out,"")) - Number(outCnt); 
      
      if (val < 0)  {
          val = 0; 
          exchangeOk = false;
      }
      else nvmem_set(item_out, val);
  }

  // Handle items which schall be added on click, only if items were added first
  if( (item_in !== undefined) && (inCnt!== undefined) && (exchangeOk == true)) {
      let val = Number(nvmem_get(item_in,"")) + Number(inCnt); 
      nvmem_set(item_in, val);
  }

  let helth = nvmem_get("helth","");
  if( helth <= 0) {
      items_set_default();
      story.load("Orga_niederlage.xml");
  }

  story.helthZeroAction();
  story.updateSidebar();
}

//**********************************************************************************************************
// load page depending on the item
//**********************************************************************************************************
function evt_load(file, item, itemCnt) {
  var  allowed = true;

  if (item != undefined) {
    const cnt = nvmem_get("item","");
    if (Number(cnt) < Number(itemCnt)) {
      allowed = false;
    }
  }

  if (allowed && (file != "this")) {
    story.load(file);
  }
}

//**********************************************************************************************************
// give items to get some other items
//**********************************************************************************************************
function evt_reset() {
  story.reset();
}

//**********************************************************************************************************
// give items to get some other items
//**********************************************************************************************************
function evt_trade(evt, itemBuy, buyCnt, itemPay, payCnt) {
  const pageItem =  story.pageItems.find(i => i.name === itemBuy);
  const ownItem =  story.ownItems.find(i => i.name === itemPay);
  const NewOwnItem =  story.ownItems.find(i => i.name === itemBuy);

  const isPageCnt = pageItem?.cnt ?? 0;
  const isOutCnt = ownItem?.cnt ?? 0;
  if ((isPageCnt >= buyCnt) && (isOutCnt >= payCnt))  {
    // Remove buyItem from page
    pageItem.cnt -= buyCnt;
    nvmem_set(story.page+"."+itemBuy, pageItem.cnt);

    // Remove ownItem 
    ownItem.cnt -= payCnt;
    nvmem_set(itemPay, ownItem.cnt);

    // Add buyItem 
    if (NewOwnItem == undefined) {
      story.ownItems.push({name: itemBuy, cnt: buyCnt});
      nvmem_set(itemBuy, buyCnt);
    } else {
      NewOwnItem.cnt += buyCnt;
      nvmem_set(itemBuy, NewOwnItem.cnt);
    }
  }

  story.helthZeroAction();
  story.updateSidebar();
  story.updateDecissions();
}

//**********************************************************************************************************
// 
//**********************************************************************************************************
function static_checkLinks(itemBuy, buyCnt, itemPay, payCnt) {
  const hiddenCnt = Number(hiddenItem_get(itemBuy));
  const cookieCnt = Number(nvmem_get(itemPay,""));

  if ((hiddenCnt < buyCnt) || (cookieCnt < payCnt))  {
    const link = evt.currentTarget;
    $(link).attr("class", "disabled-link");
  }
}

//**********************************************************************************************************
// consume something in your bag
//**********************************************************************************************************
function evt_consume(itemBuy, buyCnt, itemPay, payCnt) {
  const inItem =  story.ownItems.find(i => i.name === itemBuy);
  const outItem =  story.ownItems.find(i => i.name === itemPay);

  const isInCnt = inItem?.cnt ?? 0;
  //const isOutCnt = outItem?.cnt ?? 0;
  if ((isInCnt >= buyCnt) /*&& (isOutCnt >= payCnt)*/)  {
    // Remove buyItem
    inItem.cnt -= buyCnt;
    nvmem_set(itemBuy, inItem.cnt);

    // Remove outItem 
    outItem.cnt -= payCnt;
    if (outItem.cnt < 0) {outItem.cnt = 0}
    nvmem_set(itemPay, outItem.cnt);
  }

  story.helthZeroAction();
  story.updateSidebar();
  story.updateDecissions();

}

//**********************************************************************************************************
// sound on or off
//**********************************************************************************************************
function evt_sound_on_off(name, onoff)  {
  const audio = document.getElementById(name);
  if (onoff == true)
    audio.muted = false;
  else
    audio.muted = true;
}

//**********************************************************************************************************
// return the state of the sound on or off
//**********************************************************************************************************
function evt_sound_set(name)  {
  const audio = document.getElementById(name);
  return !audio.muted;
}

//**********************************************************************************************************
// toggle sound on/off
//**********************************************************************************************************
function evt_sound_toggle(name)  {
  const audio = document.getElementById(name);
  if (audio.muted == true) {
    audio.muted = false;
    $(".sound-overlay").attr("src", "./images/sound_on.webp");
  } else {
    audio.muted = true;
    $(".sound-overlay").attr("src", "./images/sound_off.webp");
  }
}

//**********************************************************************************************************
// fate
//**********************************************************************************************************
function evt_fate(href, text, item, cnt) {
  showOverlay("<img src='./images/Orga_zufall.webp'/>");
  $(".fate-text p").html("Es liegt nicht mehr in deiner Hand. Das Schicksal entscheidet über dein weiteres Geschick.");
  $("#fate-overlay").attr("onclick", "static_fate_callback1('"+href+"','"+text+"','"+item+"','"+cnt+"','"+"')");
  if (evt_sound_set("sound_background"))  {
    evt_sound_on_off("sound_background", false);
    evt_sound_on_off("sound_fate1", true);
    evt_sound_on_off("sound_fate2", true);
  }
}

//**********************************************************************************************************
// fate second step
//**********************************************************************************************************
function static_fate_callback1(href, text, item, cnt) {
  $("#fate-overlay").attr("onclick", "static_fate_callback2('"+href+"','"+text+"')");
  nvmem_increas(item, cnt);
  $(".fate-text p").html(text);
  evt_sound_on_off("sound_fate1", false);
}

//**********************************************************************************************************
// fate third step
//**********************************************************************************************************
function static_fate_callback2(href, text) {
  hideOverlay();
  if (evt_sound_set("sound_fate2"))  {
    evt_sound_on_off("sound_background", true);
    evt_sound_on_off("sound_fate1", false);
    evt_sound_on_off("sound_fate2", false);
  }

  story.helthZeroAction();
  story.load(href);
}

//**********************************************************************************************************
// show messaage box
//**********************************************************************************************************
function evt_show_msgBox(heading, text) {
  $("#messagebox h2").text(heading);
  $("#messagebox p").html(text);
  $("#messagebox").show();;
}
//**********************************************************************************************************
// hide messaage box
//**********************************************************************************************************
function evt_hide_msgBox() {
  $("#messagebox").hide();;
}