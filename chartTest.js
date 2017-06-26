
$(function(){

    var pieData = [
        {value : 20, label : "StarCraft II"},
        {value : 33, label : "WarCraft III"},
        {value : 13, label : "Diablo III"},
        {value : 44, label : "World Of Warcraft"},
        {value : 23, label : "Call Of Duty 8"},
        {value : 18, label : "Battle Field 3"},
        {value : 60, label : "Home World"},
        {value : 44, label : "Fat Guy"},
        {value : 23, label : "hehe"},
        {value : 80, label : "VanceInfo"}
    ];

    var lineData = [
        { Month: "Jan", "StarCraft II": 2000, "WarCraft III": 1500, "Home World": 450 },
        { Month: "Feb", "StarCraft II": 1000, "WarCraft III": 200, "Home World": 600 },
        { Month: "Mar", "StarCraft II": 1500, "WarCraft III": 500, "Home World": 300 },
        { Month: "Apr", "StarCraft II": 1800, "WarCraft III": 1200, "Home World": 900 },
        { Month: "May", "StarCraft II": 2400, "WarCraft III": 575, "Home World": 700 },
        { Month: "AAA", "StarCraft II": 598, "WarCraft III": 575, "Home World": 2800 },
        { Month: "BBB", "StarCraft II": 1358, "WarCraft III": 1800, "Home World": 500 },
        { Month: "CCC", "StarCraft II": 2689, "WarCraft III": 575, "Home World": 2500 },
        { Month: "DDD", "StarCraft II": 300, "WarCraft III": 575, "Home World": 500 }
    ];

    var columnData = [
        { Month: "Jan", "StarCraft II": 2000, "WarCraft III": 1500, "Home World": 450, "Test" : 1111 },
        { Month: "Feb", "StarCraft II": 1000, "WarCraft III": 200, "Home World": 600, "Test" : 780 },
        { Month: "Mar", "StarCraft II": 1500, "WarCraft III": 500, "Home World": 300, "Test" : 300 },
        { Month: "Apr", "StarCraft II": 1800, "WarCraft III": 1200, "Home World": 900, "Test" : 500 },
        { Month: "May", "StarCraft II": 2400, "WarCraft III": 575, "Home World": 500, "Test" : 600 }
    ];

    var pie = VChart.pieChart("pie",{
        cx : 300,
        cy : 250,
        r : 200,
        sources : pieData,
        popSingle : true
    });
    pie.draw();

    var pieLeg = VChart.legend('pieLegend', {
        host : pie
    });
    pieLeg.draw();

    var line = VChart.lineChart("line", {
        width : 800,
        height : 400,
        sources : lineData,
        graphType : "Curve",
        categoryField : "Month"
    });
    line.draw();

    var lineLeg = VChart.legend('lineLegend', {
        host : line
    });
    lineLeg.draw();

    var column = VChart.ColumnChart('column',{
        width : 1000,
        height : 500,
        sources : columnData,
        categoryField : "Month"
    });
    column.draw();

    var columnLeg = VChart.legend('columnLegend',{
        host : column
    });
    columnLeg.draw();


    var column2 = VChart.ColumnChart('stackColumn',{
        width : 800,
        height : 400,
        sources : columnData,
        categoryField : "Month",
        graphType:"Stacked"
    });
    column2.draw();

    var columnLeg2 = VChart.legend('stackColumnLegend',{
        host : column2
    });
    columnLeg2.draw();


    var bar = VChart.BarChart('barChart',{
        width : 800,
        height : 400,
        sources : columnData,
        categoryField : "Month"
    });
    bar.draw();

    var barLeg = VChart.legend('barChartLegend',{
        host : bar
    });
    barLeg.draw();

    var stackBar = VChart.BarChart('stackBarChart',{
        width : 800,
        height : 400,
        sources : columnData,
        categoryField : "Month",
        graphType : "Stacked"
    });
    stackBar.draw();

    var stackBarLeg = VChart.legend('stackBarChartLegend',{
        host : stackBar
    });
    stackBarLeg.draw();

    var testPoints = [
        {x: 50, y: 160},
        {x: 180, y: 50},
        {x: 300, y: 300},
        {x: 450, y: 100},
        {x: 688, y: 300},
        {x: 800, y: 50},
        {x: 900, y: 60}

    ];
    var canvas = Raphael("test");

});
