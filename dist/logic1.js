// var geoJSON = 'Resources/us-county-boundaries_catxva.geojson'
var geoJSON2 = 'new_file.json'

d3.json(geoJSON2).then(d => {
    console.log(d.features[0].properties);
})

var map = L.map('map').setView([37.8, -96], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
d3.json(geoJSON2).then(function(data) {


    geojson = L.geoJson(data, {
            
      style: styles,   
      // Binding a popup to each layer
      onEachFeature: function(feature, layer) {
        layer.bindPopup("<strong>" + feature.properties.County + "</strong><br /><br />Diabetes Percentage: " +
        feature.properties.DiagnosedDiabetesPercentage + "<br /><br />Total Population: " + feature.properties.Pop2010);
          
      }

    }).addTo(map);
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Diabetes Percentage:</h4>";
        div.innerHTML += `<i style="background: ${colors[6]}"></i><span> > 9.8 % </span><br>`;
        div.innerHTML += `<i style="background: ${colors[5]}"></i><span></span><br>`;
        div.innerHTML += `<i style="background: ${colors[4]}"></i><span></span><br>`;
        div.innerHTML += `<i style="background: ${colors[3]}"></i><span></span><br>`;
        div.innerHTML += `<i style="background: ${colors[2]}"></i><span></span><br>`;
        div.innerHTML += `<i style="background: ${colors[1]}"></i><span></span><br>`;
        div.innerHTML += `<i style="background: ${colors[0]}"></i><span> < 5.1 %</span><br>`;

        return div;
    };

    legend.addTo(map);
}
)
var colors = ['#feedde','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#8c2d04']
function getColor(d) {
    

    return d > 10.85 ? colors[6] :
        d > 9.7 ? colors[5] :
        d > 8.55 ? colors[4] :
        d > 7.4 ? colors[3] :
        d > 6.25 ? colors[2] :
        d > 5.1 ? colors[1] :
        colors[0];

}
function styles(feature) {
    return {
      fillColor: getColor(feature.properties.DiagnosedDiabetesPercentage),
      weight: 1,
      opacity: 1,
      color: getColor(feature.properties.DiagnosedDiabetesPercentage),
      fillOpacity: .7
    };
  }

//Top 10
d3.json("new_file.json").then(function(data) {
  var top10Data = [];
  // Sort the features in descending order based on DiagnosedDiabetesPercentage
  data.features.sort(function(a, b) {
    return b.properties.DiagnosedDiabetesPercentage - a.properties.DiagnosedDiabetesPercentage;
  });
  // Iterate over the top 10 features and add them to top10Data
  for (var i = 0; i < 10; i++) {
    top10Data.push({
      label: data.features[i].properties.County,
      value: data.features[i].properties.DiagnosedDiabetesPercentage
    });
  }
  // Sort top10Data in descending order based on value
  top10Data.sort(function(a, b) {
    return b.value - a.value;
  });
  // Take the top 10 items and reverse the order
  top10Data = top10Data.slice(0, 10).reverse();
  // Create the dropdown menu
  var select = d3.select("#dropdown")
    .append("select")
    .on("change", function() {
      var county = this.value;
      updatePieChart(county);
    });
  var options = select.selectAll("option")
    .data(top10Data)
    .enter()
    .append("option")
    .text(function(d) { return d.label; })
    .attr("value", function(d) { return d.label; });
  // Define the updatePieChart function to update the pie chart when the user selects a new county from the dropdown menu
  function updatePieChart(county) {
    var countyData = data.features.filter(function(feature) {
      return feature.properties.County === county;
    });
    var kidsTotal = 0;
    var seniorsTotal = 0;
    var adultsTotal = 0;
    var households = 0;
    var noVehicle = 0;
    var vehicle = 0;
    var yWhite = 0;
    var yBlack = 0;
    var yAsian = 0;
    var yHispanic = 0;
    countyData.forEach(function(feature) {
      kidsTotal += feature.properties.TractKids;
      seniorsTotal += feature.properties.TractSeniors;
      adultsTotal += feature.properties.Pop2010 - feature.properties.TractKids - feature.properties.TractSeniors;
      households += feature.properties.OHU2010;
      vehicle += feature.properties.TractHUNV;
      noVehicle += feature.properties.OHU2010 - feature.properties.TractHUNV;
      yWhite += feature.properties.TractWhite;
      yBlack += feature.properties.TractBlack;
      yAsian += feature.properties.TractAsian;
      yHispanic += feature.properties.TractHispanic;
    });
    var ageData = [      { label: "Kids", value: kidsTotal },      { label: "Seniors", value: seniorsTotal },      { label: "Adults", value: adultsTotal },    ];
    var vehicleData = [
      { label: "Vehicle Access", value: noVehicle },
      { label: "No Vehicle Access", value: vehicle }
    ];
    var demoData = [
      {label: "White", value: yWhite},
      {label: "Black", value: yBlack},
      {label: "Asian", value: yAsian},
      {label: "Hispanic", value: yHispanic}      
    ]
    var labels = ageData.map(function(d) { return d.label; });
    var values = ageData.map(function(d) { return d.value; });
    var trace = {
      type: 'pie',
      labels: labels,
      values: values,
      marker: {
        colors: ['#feedde', '#fff2cc', '#f7b977']
      }
    };
    var layout = {
      autosize: false,
      width: 500,
      height: 500,
      margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
      },
      plot_bgcolor: '#c7c7c7',
      title: 'Age distribution in the population'
    };
    var chartData = [trace];
    Plotly.newPlot('piechart', chartData, layout);
  var labels1 = vehicleData.map(function(d) { return d.label; });
  var values1 = vehicleData.map(function(d) { return d.value; });
  var trace1 = {
    type: 'pie',
    labels: labels1,
    values: values1,
    marker: {
      colors: ['#f7b977', '#fff2cc']
    }
  };
  var layout1 = {
    autosize: false,
    width: 500,
    height: 500,
    margin: {
      l: 50,
      r: 50,
      b: 100,
      t: 100,
      pad: 4
    },
    plot_bgcolor: '#c7c7c7',
    title: 'Vehicle Availability'
  };
  var chartData1 = [trace1];
  Plotly.newPlot('piechart1', chartData1, layout1);
  var demolabels = demoData.map(function(d) { return d.label; });
  var demovalues = demoData.map(function(d) { return d.value; });
  console.log(demolabels, demovalues)
  var tracebar = {
    x: demolabels,
    y: demovalues,
    type:'bar',
    marker:{
      color: ['#FFFFB2','#FECC5C','#FD8D3C','#E31A1C']
    },
    width: .5,
    };
    var demolayout = {
      title: "Demographic Breakdown of County",
      barmode: 'group',
      bargap: .15,
      bargroupgap: .15
    }
  Plotly.newPlot('bar', [tracebar], demolayout)
}});












