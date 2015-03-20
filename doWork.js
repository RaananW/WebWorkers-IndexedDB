var RaananW;
(function (RaananW) {
    var WorkedIDBTest;
    (function (WorkedIDBTest) {
        function doWork(data, onProgress, onSuccess) {
            function sleep(milliseconds) {
                var start = new Date().getTime();
                for (var i = 0; i < 1e7; i++) {
                    if ((new Date().getTime() - start) > milliseconds) {
                        break;
                    }
                }
            }
            var lastP = 0;
            data.forEach(function (d, idx) {
                sleep(d);
                var newP = ((idx / data.length) * 100) >> 0;
                if (newP > lastP) {
                    lastP = newP;
                    onProgress(lastP, d);
                }
            });
            onSuccess();
        }
        WorkedIDBTest.doWork = doWork;
    })(WorkedIDBTest = RaananW.WorkedIDBTest || (RaananW.WorkedIDBTest = {}));
})(RaananW || (RaananW = {}));
//# sourceMappingURL=doWork.js.map