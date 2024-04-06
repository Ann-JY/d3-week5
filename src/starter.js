import * as d3 from "d3"; //d3 가져오기
import "./viz.css"; //스타일링 첨부

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
//변수설정
//html에 svg container에 있던 id 가져오기, id 정의

let width = parseInt(d3.select("#svg-container").style("width"));
//parseInt=어떤 값을 정수로 바꿔 리턴
//svg-container의 style인 width를 가져와라
let height = parseInt(d3.select("#svg-container").style("height"));
// console.log(height); //제대로 나오나 확인

const margin = { top: 50, right: 30, bottom: 60, left: 70 }; //svg 설정 끝

//
//
//
//
//

// parsing & formatting
const parseTime = d3.timeParse("%Y");
const formatXAxis = d3.timeFormat("%Y"); //formatting은 원하는 형태로 바꿀 때

// scale
const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .ticks(10)
  .tickFormat((d) => formatXAxis(d)) //x축설정, 항목을 5개로, 그걸 포맷 적용
  .tickSizeOuter(0); //축에서 밖으로 나오는 거 삭제, 안해도 딱히 지장은 없음

const yAxis = d3
  .axisLeft(yScale)
  .ticks(5)
  .tickSize(-width + margin.right + margin.left); //가로선

// line
const line = d3
  .line()
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.avg));

const line2 = d3
  .line()
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.lower_bound));

const line3 = d3
  .line()
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.upper_bound));

const area = d3
  .area()
  .x((d) => xScale(d.date_parsed))
  .y0((d) => yScale(d.lower_bound))
  .y1((d) => yScale(d.upper_bound));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
//  data (d3.csv)
let data = [];
let path;

d3.json("data/global-temp-data.json").then((raw_data) => {
  //날씨데이터값 불러오기

  data = raw_data.map((d) => {
    // console.log(d));

    d.date_parsed = parseTime(d.year);
    return d;
  });

  //console.log(data);

  xScale.domain(d3.extent(data, (d) => d.date_parsed));
  yScale.domain([-0.6, 0.8]);

  //console.log(d3.extent(data, (d) => d.avg));/

  //axis
  svg
    .append("g") //group, 여러 요소를 넣겠다는 뜻
    // .attr("transform", "translate(0, " + (height - margin.bottom) + ")") //위치 정하기, 안하면 0,0에다 만들어짐
    .attr("class", "x-axis") //css에서 수정
    .attr("transform", `translate(0, ${height - margin.bottom + 40})`) //`를 넣으면 ()안에 변수 넣을 수 있음, 안하면 숫자만
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  //최대최소
  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .attr("fill", "red");

  // 첫 번째 라인
  path = svg
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "#d21404")
    .attr("stroke-width", 1.5);

  // 두 번째 라인(없음)
  svg
    .append("path")
    .datum(data)
    .attr("d", line2)
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("stroke-width", 1);

  // 세 번째 라인(없음)
  svg
    .append("path")
    .datum(data)
    .attr("d", line3)
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("stroke-width", 1);

  // svg
  //   .append("text")
  //   .attr(
  //     "transform",
  //     "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
  //   )
  //   .style("text-anchor", "middle")
  //   .text("연도");

  // svg
  //   .append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", 0 - margin.left)
  //   .attr("x", 0 - height / 2)
  //   .attr("dy", "1em")
  //   .style("text-anchor", "middle")
  //   .text("°C)");
});

//resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  line.x((d) => xScale(d.date_parsed)).y((d) => yScale(d.avg));
  path.attr("d", line);

  d3.select(".x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  yAxis.tickSize(-width + margin.right + margin.left);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);
});

//여기서부터 이해를 못하겠음...
window.addEventListener("resize", () => {
  // 기존에 정의된 너비와 높이, 스케일 업데이트
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  // 라인과 영역 업데이트를 위한 x, y 축의 스케일 재정의
  line.x((d) => xScale(d.date_parsed)).y((d) => yScale(d.avg));
  area
    .x((d) => xScale(d.date_parsed))
    .y0((d) => yScale(d.lower_bound))
    .y1((d) => yScale(d.upper_bound));

  // 라인 경로 업데이트
  svg.selectAll(".line").attr("d", line); // '.line' 클래스를 가진 모든 path에 대해 업데이트

  // 영역(최대최소) 경로 업데이트
  svg.selectAll(".area").attr("d", area); // '.area' 클래스를 가진 path에 대해 업데이트

  // 축 재조정
  svg.select(".x-axis").call(xAxis);
  svg.select(".y-axis").call(yAxis);
});
