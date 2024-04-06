import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
// const g = svg.append("g"); // group

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 6, right: 30, bottom: 60, left: 50 };

// parsing & formatting
const parseTime = d3.timeParse("%Y-%m-%dT00:00:00Z");
const formatXAxis = d3.timeFormat("%b %Y");
const formatDate = d3.timeFormat("%b %d, %Y");
const formatPrice = d3.format(",.2f"); // thousand + 2 decimal point

// scale
const xScale = d3.scaleUtc().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .ticks(5)
  .tickSizeOuter(0);

const yAxis = d3
  .axisLeft(yScale)
  .ticks(5)
  .tickSize(-width + margin.right + margin.left);

// line
const line = d3
  .line()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.price));

// svg elements
let path, circle, x, y;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];

// d3.csv("data/BTC-USD.csv")
//   .then((raw_data) => {
d3.json("data/bitcoin-data.json")
  .then((raw_data) => {
    console.log(raw_data);
    // data parsing
    data = raw_data.map((d) => {
      d.date_parsed = parseTime(d.timestamp);
      return d;
    });

    //  scale updated
    xScale.domain(d3.extent(data, (d) => d.date_parsed));
    yScale.domain(d3.extent(data, (d) => d.price));

    // axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // add path
    path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#8868cb")
      .attr("stroke-width", 2.2)
      .attr("d", line);

    //  update text
    const lastValue = data[data.length - 1];
    d3.select("#price").text(formatPrice(lastValue.price));
    d3.select(".b-date").text(formatDate(lastValue.date_parsed));

    //  add circle
    circle = svg
      .append("circle")
      .attr("cx", xScale(lastValue.date_parsed))
      .attr("cy", yScale(lastValue.price))
      .attr("r", 6)
      .attr("fill", "#8868cb");
    // .attr("stroke", "#fff")
    // .attr("stroke-weight", 1.5);
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  //  line updated
  line.x((d) => xScale(d.date_parsed)).y((d) => yScale(d.price));

  //  path updated
  path.attr("d", line);

  // circle
  const lastValue = data[data.length - 1];

  circle
    .attr("cx", xScale(lastValue.date_parsed))
    .attr("cy", yScale(lastValue.price));

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});
