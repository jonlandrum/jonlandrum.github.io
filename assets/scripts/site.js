$(function () {
    // Get today's date, adjusted to CST
    const date = luxon.DateTime.now().setZone('America/Chicago').toFormat('dd LLL. yyyy');
    $('#today').text(date);

    // Currency formatter
    var currency_formatter = new Intl.NumberFormat(
        (options = {
            style: 'currency',
            currency: 'USD',
        })
    );

    // Hover effects
    var mouseover = function (d) {
        d3.select(this).style('stroke', 'black').style('opacity', 1);
    };
    var mouseleave = function (d) {
        d3.select(this).style('stroke', 'none').style('opacity', 0.8);
    };

    // Margins
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 640 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;

    // Colors
    var colors = ['#98B1C7', '#C798B1', '#B1C798'];
    var z = d3.scaleOrdinal(colors);

    // Tooltips
    var price_labels = ['Base price: ', 'Maintenance costs: ', 'Fuel costs: '];
    var price_keys = ['sticker', 'maintenance', 'fuel'];

    /*
     * CHART 1
     */
    var data1 = [
        {
            vehicle: 'Nissan Sentra',
            sticker: 19460,
        },
        {
            vehicle: 'Nissan LEAF',
            sticker: 31670,
        },
    ];
    var x1 = d3
        .scaleBand()
        .domain(
            data1.map(function (d) {
                return d.vehicle;
            })
        )
        .range([0, width])
        .padding(0.5);
    var y1 = d3
        .scaleLinear()
        .domain([0, data1.reduce((a, b) => (a.sticker > b.sticker ? a : b)).sticker])
        .range([height, 0]);
    var xAxis1 = d3.axisBottom(x1).tickSize(0).tickPadding(10);
    var yAxis1 = d3.axisLeft(y1);
    var chart1 = d3
        .select('#chart1')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X Axis
    chart1
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis1);

    // Y Axis
    chart1.append('g').attr('class', 'y axis').call(yAxis1);

    // Y Axis Label
    chart1
        .append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'end')
        .attr('y', 6)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        .text('Cost to the conusmer (USD)');

    // Bars
    chart1
        .selectAll('rect')
        .data(data1)
        .enter()
        .append('rect')
        .attr('x', function (d) {
            return x1(d.vehicle);
        })
        .attr('y', function (d) {
            return y1(d.sticker);
        })
        .attr('width', x1.bandwidth())
        .attr('height', function (d) {
            return height - y1(d.sticker);
        })
        .attr('fill', colors[0])
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave)
        .append('svg:title')
        .text(function (d) {
            return 'Base price: $' + currency_formatter.format(d.sticker);
        });

    // Start with bars styled with the 'mouseleave' event
    chart1.selectAll('rect').dispatch('mouseleave');

    /*
     * CHART 2
     */
    var data2 = [
        {
            vehicle: 'Nissan Sentra',
            sticker: 19460,
            maintenance: 0.061 * 200000,
        },
        {
            vehicle: 'Nissan LEAF',
            sticker: 31670,
            maintenance: 0.031 * 200000,
        },
    ];
    var keys2 = ['sticker', 'maintenance'];
    z.domain(keys2);
    var stack2 = d3.stack().keys(keys2)(data2);
    stack2.map((d, i) => {
        d.map((d) => {
            d.key = keys2[i];
            return d;
        });
        return d;
    });
    var yMax2 = d3.max(data2, (d) => {
        var val = 0;
        for (var k of keys2) {
            val += d[k];
        }
        return val;
    });
    var x2 = d3
        .scaleBand()
        .domain(
            data2.map(function (d) {
                return d.vehicle;
            })
        )
        .range([0, width])
        .padding(0.5);
    var y2 = d3.scaleLinear().domain([0, yMax2]).range([height, 0]);
    var xAxis2 = d3.axisBottom(x2).tickSize(0).tickPadding(10);
    var yAxis2 = d3.axisLeft(y2);
    var chart2 = d3
        .select('#chart2')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X Axis
    chart2
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis2);

    // Y Axis
    chart2.append('g').attr('class', 'y axis').call(yAxis2);

    // Y Axis Label
    chart2
        .append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'end')
        .attr('y', 6)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        .text('Cost to the conusmer (USD)');

    // Bars
    chart2
        .selectAll('g')
        .data(stack2)
        .enter()
        .append('g')
        .attr('fill', (d, i) => {
            return colors[i];
        })
        .selectAll('rect')
        .data((d) => d)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x2(i))
        .attr('y', (d) => y2(d[1]))
        .attr('width', x2.bandwidth())
        .attr('height', (d) => {
            return y2(d[0]) - y2(d[1]);
        })
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave)
        .append('svg:title')
        .text((d, i) => {
            return price_labels[i] + currency_formatter.format(d[price_keys[i]]);
        });

    // Start with bars styled with the 'mouseleave' event
    chart2.selectAll('rect').dispatch('mouseleave');
});
