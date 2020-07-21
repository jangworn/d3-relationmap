var network;
var allNodes;
var allEdges;
var highlightActive = false;
var nodesDataset;
var edgesDataset;
var data;
var opts = {
    url: 'relation.json'
}

var canvas = document.getElementById("map"),
    option = {
        autoResize: !0,
        nodes: {
            shape: 'dot',
            font: {
                size: 12,
                face: 'Microsoft YaHei',
            }

        },
        edges: {
            width: 0.15,
            color: {
                inherit: 'from'
            },
            smooth: {
                type: 'continuous'
            },
            font: {
                size: 10,
                face: 'Microsoft YaHei',
                align: 'middle'
            }

        },
        physics: false,
        interaction: {
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
            hoverConnectedEdges: true,
            navigationButtons: true,
            keyboard: true
        }
    },

    fmt = function (e) {
        for (var node = {}, i = 0; i < e.length; i++) node[e[i].id] = e[i];
        return node
    }


function draw() {
    $('#load_data').show();
    var url = opts.url;
    var node = new vis.DataSet([]),
        edge = new vis.DataSet([]);
    network = new vis.Network(canvas, {
        nodes: node,
        edges: edge
    }, option);
    $.ajax({
        cache: !0,
        method: "get",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        url: url,
        dataType: 'JSON',
        success: function (e) {

            if (e.code != 200) {
                $('#load_data p').html('无数据');
                return;
            }
            path = e.data.path;

            $('#load_data p').html('画图中...');
            for (var nodes = e.data.nodes, r = fmt(nodes), links = e.data.edges, a = 0; a < links.length; a++) {
                links[a].source = r[links[a].from];
                links[a].target = r[links[a].to];
            }
            var g = function (e, o) {
                var t, r, n, a, i;
                return a = 100, r = 60, n = 1e3 / r, i = function () {
                    return Date.now()
                }, t = e.tick, e.tick = function () {
                    var r, l;
                    for (r = i(), l = a; l-- && i() - r < n;)
                        if (t()) return a = 2, !0;
                    if (e.alpha() < .02) {
                        e.stop();
                        o ? o() : void 0
                    }
                }
            },
                link = d3.layout.force().linkDistance(function (e) {
                    return 130
                }).charge(-2000).nodes(nodes).links(links);
            g(link, function () {
                $('#load_data').hide();
                highlightActive = false;


                nodesDataset = new vis.DataSet(nodes);
                edgesDataset = new vis.DataSet(links);
                data = {
                    nodes: nodesDataset,
                    edges: edgesDataset
                };
                allNodes = nodesDataset.get({
                    returnType: "Object"
                });
                allEdges = edgesDataset.get({
                    returnType: "Object"
                });
                network.setData(data);
                network.on("click", highlight);
                network.on("doubleClick", function (e) {
                    console.log('double click nodeId:' + e.nodes)
                });


            });
            link.start();

        },
        error: function () {
            $('#load_data p').html('数据升级中...');
        }
    })
}

initShow();




function highlight(params) {

    // if something is selected:
    if (params && params.nodes.length > 0) {
        highlightActive = true;
        var i, j;
        var selectedNode = params.nodes[0];
        var degrees = 1;
        if (allNodes[selectedNode].hcolor != 'rgba(200,200,200,0.5)' && allNodes[selectedNode].hcolor != undefined) {
            allNodes[selectedNode].color = allNodes[selectedNode].hcolor;
        }

        // mark all nodes as hard to read.
        for (var nodeId in allNodes) {
            if (allNodes[nodeId].color != 'rgba(200,200,200,0.5)' && allNodes[nodeId].color != undefined) {
                allNodes[nodeId].hcolor = allNodes[nodeId].color;
            }
            allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
            if (allNodes[nodeId].hiddenLabel === undefined) {
                allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                allNodes[nodeId].label = undefined;

            }



        }
        for (var edgeId in allEdges) {
            allEdges[edgeId].color.hcolor = allEdges[edgeId].color.color;
            allEdges[edgeId].color.color = 'rgba(200,200,200,0.5)';
            allEdges[edgeId].color.opacity = '0.5';
            if (allEdges[edgeId].font.color != 'rgba(200,200,200,0.5)' && allEdges[edgeId].font.color != undefined) {
                allEdges[edgeId].font.hcolor = allEdges[edgeId].font.color;
            }

            allEdges[edgeId].font.color = 'rgba(200,200,200,0.5)';
        }
        var connectedNodes = network.getConnectedNodes(selectedNode);
        var allConnectedNodes = [];

        // get the second degree nodes
        for (i = 1; i < degrees; i++) {
            for (j = 0; j < connectedNodes.length; j++) {
                allConnectedNodes = allConnectedNodes.concat(network.getConnectedNodes(connectedNodes[j]));
            }
        }

        // all second degree nodes get a different color and their label back
        for (i = 0; i < allConnectedNodes.length; i++) {
            allNodes[allConnectedNodes[i]].color = allNodes[allConnectedNodes[i]].hcolor
            //allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
            if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
                allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
                allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
            }


        }

        // all first degree nodes get their own color and their label back
        for (i = 0; i < connectedNodes.length; i++) {
            allNodes[connectedNodes[i]].color = allNodes[connectedNodes[i]].hcolor;
            if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
                allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
                allNodes[connectedNodes[i]].hiddenLabel = undefined;
            }

        }

        // the main node gets its own color and its label back.
        allNodes[selectedNode].color = allNodes[selectedNode].hcolor;
        if (allNodes[selectedNode].hiddenLabel !== undefined) {
            allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
            allNodes[selectedNode].hiddenLabel = undefined;
        }
        for (var edgeId in allEdges) {
            if (allEdges[edgeId].from == selectedNode || allEdges[edgeId].to == selectedNode) {
                allEdges[edgeId].color.color = allEdges[edgeId].color.hcolor;
                allEdges[edgeId].font.color = allEdges[edgeId].font.hcolor;
            }
        }
    } else if (highlightActive === true) {
        // reset all nodes

        for (var nodeId in allNodes) {
            allNodes[nodeId].color = allNodes[nodeId].hcolor;
            if (allNodes[nodeId].hiddenLabel !== undefined) {
                allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                allNodes[nodeId].hiddenLabel = undefined;

            }
            for (var edgeId in allEdges) {
                allEdges[edgeId].color.color = allEdges[edgeId].color.highlight;
                allEdges[edgeId].font.color = allEdges[edgeId].font.hcolor;
            }


        }
        highlightActive = false
    }

    // transform the object into an array
    var updateArray = [];
    for (nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
            updateArray.push(allNodes[nodeId]);
        }

    }

    var updateArray2 = [];
    for (edgeId in allEdges) {
        if (allEdges.hasOwnProperty(edgeId)) {
            updateArray2.push(allEdges[edgeId]);
        }
    }

    nodesDataset.update(updateArray);
    edgesDataset.update(updateArray2);
}




function initShow() {

    draw();
    $('.vis-button.vis-zoomIn').html('<a type="button" id="zoom-in" class="btn btn-default btn-circle zoom-in"><img src="./assets/img/Enlarge.png"></a>');
    $('.vis-button.vis-zoomOut').html(' <a type="button"  id="zoom-out" class="btn btn-default btn-circle zoom-out"><img src="./assets/img/shrink.png"></a>');
    $('#button_box a.action').off('click').on('click', function () {

        if ($('#handle_box')[0].style.display == 'none' || !$('#handle_box')[0].style.display) {
            $('#handle_box').show();
        } else {
            $('#handle_box').hide();
        }

    })

    $('#button_box a.download').off('click').on('click', function () {
        download('jpg')
    })
    $('#button_box a.refresh').off('click').on('click', function () {
        window.location.reload();
    })

    function download(type) {
        var old_canvas = document.getElementById("map").childNodes[0].firstChild;

        var url = old_canvas.toDataURL("image/jpg");
        var canvas = document.createElement('canvas');
        canvas.width = old_canvas.width;
        canvas.height = old_canvas.height;
        context = canvas.getContext("2d");
        var image = new Image;
        image.src = url;
        context.fillStyle = '#ffffff';
        //draw background / rect on entire canvas
        context.fillRect(0, 0, canvas.width, canvas.height);
        //image.src = document.getElementsByTagName('img')[0].src;  
        image.onload = function () {
            context.drawImage(image, 0, 0);
            var a = document.createElement("a");
            a.download = new Date().toLocaleDateString() + '.' + type;
            a.href = canvas.toDataURL("image/jpg");
            a.click();
        };
        return false;
    }

}

