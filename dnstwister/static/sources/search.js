var resolve = function(encoded_domain, callback) {
    const request = new XMLHttpRequest();
    const url='/api/ip/' + encoded_domain;
    request.open("GET", url);
    request.send();
    request.onreadystatechange = (e) => {
        if(request.readyState === 4) {
            if(request.status === 200) {
                var responseText = request.responseText;
                var response = JSON.parse(responseText);
                if (response.error === false) {
                    callback(response.ip);
                }
                else {
                    callback(null);
                }
            }
            else {
                callback(null);
            }
        }
    }
}

var reportRowElem = function(domain, tweak, ipText, show) {
    var rowElem = document.createElement('tr');
    var domainCellElem = document.createElement('td');
    var tweakCellElem = document.createElement('td');
    var ipCellElem = document.createElement('td');

    domainCellElem.appendChild(document.createTextNode(domain));
    tweakCellElem.appendChild(document.createTextNode(tweak));
    ipCellElem.appendChild(document.createTextNode(ipText));

    rowElem.appendChild(domainCellElem);
    rowElem.appendChild(tweakCellElem);
    rowElem.appendChild(ipCellElem);

    rowElem.className = 'domain-row';
    if (show === true) {
        rowElem.className = 'resolved';
    }

    return rowElem;
}

var search = function(encoded_domain) {

    var checkedCount = 0;
    var resolvedCount = 0;

    var checkedCountElem = document.getElementById('checked_count');
    var resolvedCountElem = document.getElementById('resolved_count');

    var report_elem = document.getElementById('report_target');

    jsonpipe.flow('/api/fuzz_chunked/' + encoded_domain, {
        'success': function(data) {
            resolve(data.encode_domain, function(ip) {
                checkedCount += 1;
                checkedCountElem.innerHTML = checkedCount;

                if (ip === null) {
                    report_elem.appendChild(
                        reportRowElem(data.domain, data.fuzzer, 'Error!', true)
                    );
                    return;
                }

                if (ip === false) {
                    report_elem.appendChild(
                        reportRowElem(data.domain, data.fuzzer, 'None resolved', false)
                    );
                    return;
                }

                resolvedCount += 1;
                resolvedCountElem.innerHTML = resolvedCount;
                report_elem.appendChild(
                    reportRowElem(data.domain, data.fuzzer, ip, true)
                );
            });
        }
    });
}
