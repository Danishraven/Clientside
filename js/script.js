import { ignore, ignore2 } from "./modules/filter.js";

const swapiApp = (async function () {

    const SWAPIURL = "https://swapi.dev/api";
    const navBar = document.querySelector("#nav-bar");
    const cardContainer = document.querySelector(".card-container");
    const detailedCard = document.querySelector(".detailed-card");

    try {
        const response = await fetch(SWAPIURL);
        const jsonData = await response.json();
        for (let key in jsonData) {
            let navItem = document.createElement("a");
            navItem.addEventListener("click", navClick);
            navItem.className = "nav-item";
            navItem.innerText = key;
            navItem.href = jsonData[key];
            navBar.appendChild(navItem);
        }
        // Simulerer et museklik på "nav-item" [0] i "nav-bar"
        document.querySelectorAll(".nav-item")[0].click();
    }
    catch (error) {
        console.log(error);
    }

    async function navClick(e) {
        e.preventDefault();
        document.querySelector(".active")?.classList.remove("active");
        this.classList.add("active");
        let data = await getData(this.href);
        showData(data);
    }
    
    function showData(data) {
        //changes cardContainers display to grid
        cardContainer.style.display = "grid";
        document.querySelector("#paging").innerHTML = "";
        cardContainer.innerHTML = "";
        detailedCard.innerHTML = ""
        detailedCard.style = "height: 0; padding: 0; border-radius: 0;"
        if (data.previous) {
            const btnPrev = document.createElement("a");
            btnPrev.className = "material-symbols-outlined";
            btnPrev.innerText = "arrow_back";
            btnPrev.href = data.previous;
            btnPrev.addEventListener("click", getPage);
            document.querySelector("#paging").appendChild(btnPrev)
        }
        if (data.next) {
            const btnNext = document.createElement("a");
            
            btnNext.className = "material-symbols-outlined";

            btnNext.innerText = "arrow_forward";
            btnNext.href = data.next;
            btnNext.addEventListener("click", getPage);
            document.querySelector("#paging").appendChild(btnNext)
        }
        data.results.forEach((dataItem) => {
            let card = document.createElement("button");
            card.className = "card";
            for (let [k, v] of Object.entries(dataItem)) {
                if (ignore.includes(k)) { continue; }
                // if (!Array.isArray(v)) {
                    card.insertAdjacentHTML(
                        "beforeend",
                        `<span class="key">${k.replaceAll("_", " ")}</span>: <span class="val">${v}</span><br>`
                    );
                // }
            }
            card.href = dataItem.url
            card.addEventListener("click", showSpecificData);
            cardContainer.appendChild(card);
        });
    }

    async function getPage(e) {
        e.preventDefault()
        const data = await getData(this.href);
        showData(data);
    }

    async function getData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async function showSpecificData(){
        //calls the API to get relevant data
        let data = await getData(this.href);
        //empties the data window in case another thing is selected to be viewed
        detailedCard.innerHTML = ""
        detailedCard.style = "max-height: 70%; padding: 10px; border-radius: 10px;"

        //creates a button that can close the data window
        const closeBtn = document.createElement("button")
        closeBtn.className = "material-symbols-outlined closeBtn";
        closeBtn.innerText = "Close";
        closeBtn.addEventListener("click", closePage);
        detailedCard.appendChild(closeBtn)

        for (let [k, v] of Object.entries(data)) {
            //checks if the key is a value on the ignore2 list and goes on to the next object if true
            if (ignore2.includes(k)) { continue; }
            //checks if the value is an array and goes into the if statement if it is not an array, else it goes to the else statement
            if (!Array.isArray(v)) {
                //inserts the key and the value
                if(v.length >= 5 && v.substring(0,5).toLowerCase() == "https"){
                    let subData = await getData(v)
                    for (let [key, value] of Object.entries(subData)){
                        if(key == "name" || key == "title"){
                            detailedCard.insertAdjacentHTML(
                                "beforeend",
                                `<span class="key">${key.replaceAll("_", " ")}</span>: <span class="val">${value}</span><br>`
                            );
                        }
                    }
                } else{
                    detailedCard.insertAdjacentHTML(
                        "beforeend",
                        `<span class="key">${k.replaceAll("_", " ")}</span>: <span class="val">${v}</span><br>`
                    );
                }
            }
            else {
                //creates an unorderd list that will contain both the key and all the values from the key-value array
                let list = document.createElement("ul")
                //removes the bullets from the list
                list.style = "list-style-type: none"
                //checks 
                if(v.length != 0){
                    //inserts the key into the list
                    list.insertAdjacentHTML(
                        "beforeend",
                        `<br><li class="key">${k.replaceAll("_", " ")}:</li>`
                    );
                    //creates a list element that will contain the unordered list of the value array
                    let listContainer = document.createElement("li")
                    //creates the unordered list that will contain all the array values
                    let innerList = document.createElement("ul")
                    //sets indentation 
                    innerList.style = "list-style-type: none; text-indent: 2rem"
                    //goes through each element in the value-array and adds it to innerList
                    v.forEach(async element => {
                        console.log(element)
                        if(v.length >= 5 && element.substring(0,5).toLowerCase() == "https"){
                            let subData = await getData(element)
                            for (let [key, value] of Object.entries(subData)){
                                if(key == "name" || key == "title"){
                                    innerList.insertAdjacentHTML(
                                        "beforeend",
                                        `<li class="val">${value}</li>`
                                    );
                                }
                            }
                        } else {
                            innerList.insertAdjacentHTML(
                                "beforeend",
                                `<li class="val">${element}</li>`
                            );
                        }
                    });
                    //assembles the lists and adds it to the card
                    listContainer.appendChild(innerList)
                    list.appendChild(listContainer)
                } else {
                    //inserts the key into the list and notes that there is no value
                    list.insertAdjacentHTML(
                        "beforeend",
                        `<br><li class="key">${k.replaceAll("_", " ")}: n/a</li><br>`
                    );
                }
                detailedCard.appendChild(list)
            }
        }
    }
    function closePage(){
        detailedCard.innerHTML = ""
        detailedCard.style = "max-height: 0; padding: 0; border-radius: 0;"
    }
})();
