const fileMap = {
    "all": "starwars-interactions/starwars-full-interactions-allCharacters.json",
    "1": "starwars-interactions/starwars-episode-1-interactions-allCharacters.json",
    "2": "starwars-interactions/starwars-episode-2-interactions-allCharacters.json",
    "3": "starwars-interactions/starwars-episode-3-interactions-allCharacters.json",
    "4": "starwars-interactions/starwars-episode-4-interactions-allCharacters.json",
    "5": "starwars-interactions/starwars-episode-5-interactions-allCharacters.json",
    "6": "starwars-interactions/starwars-episode-6-interactions-allCharacters.json",
    "7": "starwars-interactions/starwars-episode-7-interactions-allCharacters.json"
};

let selectedCharacter = null;
let updateView1 = null;
let updateView2 = null;

let globalThreshold = 1;
let hideIsolated = false;

//  dropdowns
function setupDropdown(selectId, svgId) {

    const select = d3.select(selectId);

    Object.keys(fileMap).forEach(key => {
        select.append("option")
            .attr("value", key)
            .text(key === "all" ? "All Episodes" : "Episode " + key);
    });

    select.on("change", function() {
        const file = fileMap[this.value];
        drawNetwork(svgId, file);
    });

    drawNetwork(svgId, fileMap["all"]);
}

// graf
let networks = []; // sparar båda nätverken

function drawNetwork(svgId, filePath) {

    d3.json(filePath).then(data => {

        const originalNodes = data.nodes;
        const originalLinks = data.links;

        const svg = d3.select(svgId);
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;

        svg.selectAll("*").remove();

        const zoomGroup = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 5])
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform);
            });

        svg.call(zoom);

        const linkLayer = zoomGroup.append("g");
        const nodeLayer = zoomGroup.append("g");

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(30))
            .force("charge", d3.forceManyBody().strength(-40))
            .force("center", d3.forceCenter(width/2, height/2))
            .force("collision", d3.forceCollide().radius(8));

        function update(threshold, hideIsolated) {

            const filteredLinks = originalLinks.filter(l => l.value >= threshold);

            const connected = new Set();
            filteredLinks.forEach(l => {
                connected.add(l.source);
                connected.add(l.target);
            });

            const filteredNodes = hideIsolated
                ? originalNodes.filter((n, i) => connected.has(i))
                : originalNodes;

            const indexMap = new Map();
            filteredNodes.forEach((n, i) => {
                indexMap.set(originalNodes.indexOf(n), i);
            });

            const remappedLinks = filteredLinks
                .filter(l => indexMap.has(l.source) && indexMap.has(l.target))
                .map(l => ({
                    source: indexMap.get(l.source),
                    target: indexMap.get(l.target),
                    value: l.value
                }));

            simulation.nodes(filteredNodes);
            simulation.force("link").links(remappedLinks);
            simulation.alpha(1).restart();

            const link = linkLayer.selectAll("line")
                .data(remappedLinks)
                .join("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => Math.sqrt(d.value) * 0.5);

            link.append("title")
                .text(d =>
                    filteredNodes[d.source.index].name +
                    " – " +
                    filteredNodes[d.target.index].name +
                    "\nScenes: " + d.value
                );

            const node = nodeLayer.selectAll("circle")
                .data(filteredNodes)
                .join("circle")
                .attr("r", d => 4 + Math.sqrt(d.value))
                .attr("fill", d => d.colour)
                .style("cursor", "pointer");

            node.append("title")
                .text(d =>
                    d.name +
                    "\nScenes: " + d.value
                );

            node.on("click", function(event, d) {

                selectedCharacter = d.name;

                d3.selectAll("circle")
                    .classed("highlight", node =>
                        node.name === selectedCharacter
                    );
            });

            simulation.on("tick", () => {

                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        }

        // spara update-funktion
        if (svgId === "#view1") {
            updateView1 = update;
        } else {
            updateView2 = update;
        }
        // initial render
        update(globalThreshold, hideIsolated);
    });
} 

d3.select("#edgeSlider").on("input", function() {
    globalThreshold = +this.value;
    d3.select("#edgeValue").text(globalThreshold);
    applyGlobalFilter();
});

d3.select("#hideIsolated").on("change", function() {
    hideIsolated = this.checked;
    applyGlobalFilter();
});

function applyGlobalFilter() {
    if (updateView1) updateView1(globalThreshold, hideIsolated);
    if (updateView2) updateView2(globalThreshold, hideIsolated);
}


setupDropdown("#select1", "#view1");
setupDropdown("#select2", "#view2");