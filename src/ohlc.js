"use strict";

import {scales} from './scales.js';

class Ohlc {
    constructor() {
        this.data = [];
        this.ohlcRectVisibleWidth = 2;
    }

    update() {
        let d = this.data.filter(d=>d.date > scales.x.domain()[0] && d.date < scales.x.domain()[1]);

        let step = scales.x(d[1].date)-scales.x(d[0].date);
        let candleWidth = Math.floor(step/1.2);

        window.stemContainer.selectAll("line")
            .data(d)
            .exit()
            .remove();

        window.stemContainer.selectAll("line")
            .data(d)
            .attrs(this.stemAttrs(d, candleWidth))
            .enter()
            .append('line')
            .attr('class', 'cs_stem')
            .attrs(this.stemAttrs(d, candleWidth));

        if (candleWidth >= this.ohlcRectVisibleWidth) {
            window.rectContainer.selectAll("rect")
                .data(d)
                .exit()
                .remove();

            window.rectContainer.selectAll("rect")
                .data(d)
                .attrs(this.rectAttrs(d, candleWidth))
                .enter()
                .append("rect")
                .attr("class", "cs_rect")
                .attrs(this.rectAttrs(d, candleWidth));
        } else {
            window.rectContainer.selectAll("rect")
            .remove();
        }
    }

    stemAttrs(d, candleWidth) {
        return {
            x1: (d) => {return Math.round(scales.x(d.date)); },
            x2: (d) => {return Math.round(scales.x(d.date)); },
            y1: (d) => {return Math.round(scales.y(d.high)); },
            y2: (d) => {return Math.round(scales.y(d.low)); },
            stroke: (d) => {
                if (candleWidth < this.ohlcRectVisibleWidth) {
                    return d.open < d.close ? "#6ba583" : "#d75442";
                } else {
                    return '#737375';
                }
            }
        };
    }

    rectAttrs(d, candleWidth) {
        return {
            x: (d) => { return scales.x(d.date) - 0.5 * candleWidth; },
            y: (d) => { return Math.round(scales.y(d3.max([d.open, d.close]))); },
            height: (d) => { return Math.round(scales.y(d3.min([d.open, d.close])) - scales.y(d3.max([d.open, d.close]))); },
            width: (d) => { return candleWidth; },
            fill: (d) => { return d.open < d.close ? "#6ba583" : "#d75442"; }
        };
    }

    parse(result) {
        let combinedData = d3.zip(result['ticks'], result['open'], result['high'], result['low'], result['close']);
        let parsedData = [];
        combinedData.forEach(function(d) {
            let date = d[0].toString().substring(0, 10);
            parsedData.push({
                date: d3.timeParse("%s")(date),
                open: +d[1],
                high: +d[2],
                low: +d[3],
                close: +d[4]
            });
        });
        this.data = parsedData.concat(this.data);
    }

}

export const ohlc = new Ohlc();
