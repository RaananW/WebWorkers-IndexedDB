importScripts("doWork.js");
onmessage = function (e) {
    var msg = e.data;
    var db;
    var request = indexedDB.open(msg.dbName, msg.dbVersion);
    request.onerror = function (event) {
        alert("Why didn't you allow my test app to use IndexedDB?!");
    };
    request.onsuccess = function (event) {
        db = event.target['result'];
        var trans = db.transaction("numbers", IDBTransaction.READ_ONLY);
        var store = trans.objectStore("numbers");
        var items = [];
        trans.oncomplete = function (evt) {
            RaananW.WorkedIDBTest.doWork(items, function (progress) {
                postMessage(progress, null);
            }, function () {
                postMessage("finished", null);
            });
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onerror = function (error) {
            console.log(error);
        };
        cursorRequest.onsuccess = function (evt) {
            var cursor = evt.target['result'];
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            }
        };
    };
};
//# sourceMappingURL=webworker.js.map