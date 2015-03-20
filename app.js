var RaananW;
(function (RaananW) {
    var WorkedIDBTest;
    (function (WorkedIDBTest) {
        function generateData(length, maxDelay) {
            if (maxDelay === void 0) { maxDelay = 25; }
            var data = [];
            for (var i = 0; i < length; ++i) {
                data.push((Math.random() * maxDelay) >> 0);
            }
            return data;
        }
        WorkedIDBTest.generateData = generateData;
        function openDatabase(dbName, dbVersion, deleteDatabase, successCallback) {
            if (deleteDatabase) {
                indexedDB.deleteDatabase(dbName);
            }
            var request = indexedDB.open(dbName, dbVersion);
            request.onupgradeneeded = function (event) {
                var db = event.target['result'];
                var objStore = db.createObjectStore("numbers", { autoIncrement: true });
                successCallback(db, objStore);
            };
        }
        function storeInDb(objectStore, data, asArray, successCallback) {
            var clearReq = objectStore.clear();
            clearReq.onsuccess = function () {
                if (asArray) {
                    var req = objectStore.add(data, "array");
                    req.onsuccess = function () {
                        successCallback();
                    };
                }
                else {
                    var added = 0;
                    for (var i = 0; i < data.length; ++i) {
                        var req = objectStore.add(data[i]);
                        req.onsuccess = function () {
                            if (++added == data.length) {
                                successCallback();
                            }
                        };
                    }
                }
            };
        }
        function getData(db, asArray, successCallback) {
            var trans = db.transaction("numbers", IDBTransaction.READ_ONLY);
            var store = trans.objectStore("numbers");
            var items = [];
            trans.oncomplete = function (evt) {
                successCallback(items);
            };
            if (asArray) {
                var req = store.get("array");
                req.onsuccess = function (e) {
                    successCallback(e.target['result']);
                };
            }
            else {
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
            }
        }
        function runSingleTest(data, asArray, webworker, successCallback, progress) {
            if (!webworker) {
                WorkedIDBTest.doWork(data, progress, function () {
                    successCallback(data);
                });
            }
            else {
                var db = openDatabase("webworkerTest", 1, true, function (db, objStore) {
                    console.log("db opened");
                    storeInDb(objStore, data, asArray, function () {
                        webworker.onmessage = function (ev) {
                            if (progress)
                                progress(ev.data);
                            if (ev.data === "finished") {
                                getData(db, asArray, function (sortedData) {
                                    db.close();
                                    successCallback();
                                    webworker.onmessage = null;
                                });
                            }
                        };
                        webworker.postMessage({ dbName: "webworkerTest", dbVersion: 1, asArray: asArray });
                    });
                });
            }
        }
        WorkedIDBTest.runSingleTest = runSingleTest;
    })(WorkedIDBTest = RaananW.WorkedIDBTest || (RaananW.WorkedIDBTest = {}));
})(RaananW || (RaananW = {}));
$(function () {
    var data;
    var webworker = new Worker('webworker.js');
    $("#generateData").click(function () {
        data = RaananW.WorkedIDBTest.generateData($("#numberOfItems").val(), $("#maxDelay").val());
    }).click();
    $(".runTest").click(function () {
        var worker = $(this).data("worker") == true ? webworker : null;
        $("#progressBar").width("0").removeClass("progress-bar-success");
        RaananW.WorkedIDBTest.runSingleTest(data, false, worker, function () {
            $("#progressBar").width("100%").addClass("progress-bar-success");
            ;
        }, function (progress) {
            $("#progressBar").width(progress + "%");
        });
    });
});
//# sourceMappingURL=app.js.map