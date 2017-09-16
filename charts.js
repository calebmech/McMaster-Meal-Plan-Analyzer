var el_locationVisitDistribution = document.getElementById('locationVisitDistribution').getContext('2d');

var locationNames = [];
var locationVisits = [];

vm.locations.forEach(function(location) {
   locationNames.push(location.location);
   locationVisits.push(location.timesVisited);    
});
console.log("working");

function generateColors(n) {
    var colors = [];
    for(i = 0; i < n; i++) {
        console.log("ran");
        colors.push("hsl(" + (359/n * i) +", 85%, 60%)");
    };
    return colors;
}
function generateHoverColors(n) {
    var colors = [];
    for(i = 0; i < n; i++) {
        console.log("ran");
        colors.push("hsl(" + (359/n * i) +", 95%, 40%)");
    };
    return colors;
}

var locationVisitDistribution = new Chart(el_locationVisitDistribution, {
    type: 'pie',
    data: {
        labels: locationNames,
        datasets: [{
            label: "locationVisitDistribution",
            backgroundColor: generateColors(locationNames.length),
            hoverBackgroundColor: generateHoverColors(locationNames.length),
            borderColor: 'white',
            data: locationVisits,
        }]
    }
})