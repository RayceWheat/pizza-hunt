// create variable to hold DB connection 
let db;
// establish a connection to IndexedDB databse called 'pizza_hunt' and set 
const request = indexedDB.open('pizza_hunt', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the databse
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an 
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // when db is successfully created with its object store
    db = event.target.result;

    // check if app is online, if yes run uploadPizza() function
    if (navigator.onLine) {
        // we haven;t created this yet, but we will soon  so lets comment it out
        uploadPizza();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submite a new pizza
function saveRecord(record) {
    // open a new transtaction with the databse with read and write permssion
    const transtaction = db.transaction(['new_pizza'], 'readwrite');

    // access the object store for `new_pizza`
    const pizzaObjectStore = transtaction.ObjectStore('new_pizza');

    // add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access your object store 
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
    // upon a successful .getall() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in the indexedDb's store, let's send it to the api
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
             .then(response => response.json())
             .then(serverResponse => {
                 if (serverResponse.message) {
                     throw new Error(serverResponse);
                 }
                 // open one more transaction
                 const transaction = db.transaction(['new_pizza', 'readwrite']);
                 // access thew new_pizza object store
                 const pizzaObjectStore = transaction.objectStore('new_pizza');
                 // clear all items in your store
                 pizzaObjectStore.clear();

                 alert('All saved pizza has been submitted!');
             })
             .catch(err => {
                 console.log(err);
             });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);