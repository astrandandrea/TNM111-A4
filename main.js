d3.json("sw/starwars-episode-2-interactions-allCharacters.json")

.then(function(data) {

    const width = 1000;
    const height = 800;

    const nodes = data.nodes;
    const links = data.links;

    const svg = d3.select("#network");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d, i) => i))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.select(".links")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#aaa");

    const node = svg.select(".nodes")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "steelblue");

    simulation.on("tick", function() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

});