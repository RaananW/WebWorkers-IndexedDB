# WebWorkers with IndexedDB
##About
Running expensive processes on the main JS thread will cause the UI to flicker or the website be non-responsive. 

The solution that was introduced was web workers - JS code that is running concurrently to the main (UI) thread. Web workers have a very limited scope and very limits set of tools to interact with the browser and the DOM itself (https://developer.mozilla.org/en-US/docs/Web/API/Worker/Functions_and_classes_available_to_workers)

Sending data to and from the web worker is done using JSON/String messages and ArrayBuffers. I will not be talking about the up and down sides of using both.

Another option to send data to web workers is using IndexedDB. This option was not available at the beginning and is slowly being introduced to all of the major browsers (Chrome > 37, IE > 10, FF. Safari?... still waiting.).

##The Demo
To introduce the combination of both technologies I have implemented a very quick demo available here - http://raananw.github.io/WebWorkers-IndexedDB/

The site generates a random array of integers and is using this data to generate delays (or simulate work). It has the option to execute the work on both the main thread and a web worker.

The main thread simply executes the work. You will notice that the UI gets stuck until the process is over. The progress bar is being updated, but it doesn't show.

The web worker option is executing the following tasks (I know, UML would be much better :-) ):

1. [Main Thread] Store the entire array (single items) in an indexed db store.
```javascript
var added = 0;
for (var i = 0; i < data.length; ++i) {
    var req = objectStore.add(data[i]);
    req.onsuccess = function () {
        if (++added == data.length) {
            successCallback();
        }
    }
}
```
2. [Main Thread] Send a simple post message with the name of the db and the name of the store to execute
```javascript
webworker.postMessage({ dbName: "webworkerTest", dbVersion:1, asArray: asArray });
```
3. [WebWorker] Open the database, fetch all records from the store (using a cursor)
```javascript
//...
var cursor = evt.target['result'];
if (cursor) {
    items.push(cursor.value);
    cursor.continue();
}
```
4. [WebWorker] Do the work (the exact same function that was used in the main thread's work). [Main Thread] Update the progress bar.
5. [WebWorker] Notify the main thread that we are finished.
6. [Main thread] Load the records from the db (to simulate an update that was done by the web worker).
7. ???
8. Profit.

## Why?

Because it can be super heplful. Having a persisted model in a DB and having an external thread process it and update it can benefit a lot of applications - from games to heavy canvas manipulations (WebGL comes to mind as well). 

##Suggestions?

If you need something specific please contact me.

##MIT License

Copyright (c) 2014-2015 Raanan Weber (info@raananweber.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

