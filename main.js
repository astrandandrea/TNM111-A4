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
function drawNetwork(svgId, filePath) {

    d3.json(filePath).then(data => {

        const nodes = data.nodes;
        const links = data.links;

        const svg = d3.select(svgId);
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;

        svg.selectAll("*").remove();

        // skapar zoom 
        const zoomGroup = svg.append("g");

        // zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 5])  
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform);
          });

svg.call(zoom);

        const linkLayer = zoomGroup.append("g");
        const nodeLayer = zoomGroup.append("g");

        const simulation = d3.forceSimulation(nodes)

            .force("link",
                d3.forceLink(links)
                  .id((d,i) => i)
                  .distance(30)
            )

            .force("charge", d3.forceManyBody().strength(-40))

            .force("center", d3.forceCenter(width/2, height/2))

            .force("collision", d3.forceCollide().radius(8))

            .on("tick", ticked);


        // rita lnjer
        const link = linkLayer.selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-width", d => Math.sqrt(d.value) * 0.5)

            // TOOLTIP FÖR LÄNKAR
            .append("title")
            .text(d =>
                nodes[d.source.index].name +
                " – " +
                nodes[d.target.index].name +
                "\nScenes: " + d.value
            );

        // rita noder
        const node = nodeLayer.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", d => 4 + Math.sqrt(d.value))
            .attr("fill", d => d.colour)

            .append("title")
            .text(d =>
                d.name +
                "\nScenes: " + d.value
            );


        const circles = nodeLayer.selectAll("circle");

        // brush + link vid klick
        circles.on("click", function(event, d) {

            selectedCharacter = d.name;

            // Markera noder i båda grafer
            d3.selectAll("circle")
                .classed("highlight", node =>
                    node.name === selectedCharacter
                );
        });


        function ticked() {

            linkLayer.selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            circles
                .attr("cx", d => {
                    const r = 4 + Math.sqrt(d.value);
                    d.x = Math.max(r, Math.min(width - r, d.x));
                    return d.x;
                })
                .attr("cy", d => {
                    const r = 4 + Math.sqrt(d.value);
                    d.y = Math.max(r, Math.min(height - r, d.y));
                    return d.y;
                });
        }

    });
}


setupDropdown("#select1", "#view1");
setupDropdown("#select2", "#view2");