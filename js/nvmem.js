//**********************************************************************************************************
// set nvmem to the value
//**********************************************************************************************************
function nvmem_set(name, value) {
    localStorage.setItem(name, value);
/*    
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
*/
}

//**********************************************************************************************************
// read nvmem return the value
//**********************************************************************************************************
function nvmem_get(name, defVal) {
    var retVal = localStorage.getItem(name);
    if (retVal  === null) {
        retVal = defVal;
    }
    return retVal;
/*
    var retVal = defVal;
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const parts = decodedCookie.split(';');
    for (let p of parts) {
        while (p.charAt(0) === ' ') p = p.substring(1);
        if (p.indexOf(cname) === 0) {
            retVal = p.substring(cname.length, p.length);
            break;
        }
    }
    return retVal;
*/
}

//**********************************************************************************************************
// get all key-values as an array
//**********************************************************************************************************
function nvmem_getAll() {
    const result = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        result.push({name:key, value:value});
    }

    return result;
/*
    return document.cookie
        .split(";")
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0)
        .map(cookieStr => {
        const [name, ...rest] = cookieStr.split("=");
        return {
            name,
            value: rest.join("=") // Falls der Wert selbst "=" enthält
        };
    });
*/
}

//**********************************************************************************************************
// delete a cookie
//**********************************************************************************************************
function nvmem_delete(name) {
    localStorage.removeItem(name);
/*
    // Ablaufdatum in die Vergangenheit setzen
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
*/
}

//**********************************************************************************************************
// delete all key, values 
//**********************************************************************************************************
function nvmem_deleteAll() {
    localStorage.clear();
/*
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

        // Cookie für die gesamte Seite löschen
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
*/
}

//**********************************************************************************************************
// increas the value with name
// the value must be a number
//**********************************************************************************************************
function nvmem_increas(name, amount) {
    const latest = nvmem_get(name,0);
    let val = Number(latest) + Number(amount); 

    if (val < 0)  {
        val = 0; 
    }
    nvmem_set(name, val);
}