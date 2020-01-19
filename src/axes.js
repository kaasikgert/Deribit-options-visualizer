"use strict";

import {size} from './size.js';
import {api} from './api.js';
import {scales} from './scales.js';

class Axes {
    constructor() {
        this.tickValues = [];
        for (let i = 0; i <= 25000; i+=250) {
            this.tickValues.push(i);
        }
    }

    create() {
        this.ohlcGridX = window.ohlcGrid.append("g")
            .attr("class", "grid");
        this.ohlcGridY = window.ohlcGrid.append("g")
            .attr("class", "grid");

        this.pnlGridX = window.pnlGrid.append("g")
            .attr("class", "grid");
        this.pnlGridY = window.pnlGrid.append("g")
            .attr("class", "grid");

        this.ohlcAxisX = window.left.append("g");
        this.pnlAxisX = window.right.append("g");

        this.update();
    }

    update() {
        this.ohlcAxisX
            .attr("transform", "translate(0," + size.height + ")")
            .call(d3.axisBottom(scales.x));
        this.pnlAxisX
            .attr("transform", "translate(0," + size.height + ")")
            .call(d3.axisBottom(scales.x2));

        this.ohlcGridX
            .call(d3.axisBottom(scales.x).tickFormat("").tickSize(size.height));
        this.pnlGridX
            .call(d3.axisBottom(scales.x2).tickFormat("").tickSize(size.height));

        this.pnlGridX.selectAll('g.tick')
          .filter(function(d){ return d==0;} )
          .select('line')
          .style('stroke', '#C0ECBE')
          .style('stroke-width', 3);

        this.ohlcGridY
            .call(d3.axisRight(scales.y).tickFormat("").tickSize(size.leftWidth).tickValues(this.tickValues));
        this.pnlGridY
            .call(d3.axisRight(scales.y).tickFormat("").tickSize(size.rightWidth).tickValues(this.tickValues));

        this.ohlcAxisX.select('path').remove();
        this.pnlAxisX.select('path').remove();

        this.updateYaxis();
    }

    updateYaxis() {
        this.yAxis = window.centerAxis.selectAll('g')
            .data(this.tickValues)
            .attr("transform", (d) => {return "translate(0," + scales.y(d) + ")"})
            .enter()
            .append('g')
            .attr("transform", (d) => {return "translate(0," + scales.y(d) + ")"});

        this.yAxis
            .append('rect')
            .attr('fill', (d) => {return this.strikesInclude(d, "#2B7A78", "none")})
            .style("cursor", (d) => {return this.strikesInclude(d, "pointer", "default")})
            .on("click", (d) => this.onStrikeClick(d))
            .attr('width', 50)
            .attr('height', 21)
            .attr('y', -10);

        this.yAxis
            .append('text')
            .attr('fill', (d) => {return this.strikesInclude(d, "white", "black")})
            .style("cursor", (d) => {return this.strikesInclude(d, "pointer", "default")})
            .on("click", (d) => this.onStrikeClick(d))
            .attr("text-anchor", "middle")
            .attr('y', 5)
            .attr('x', 24.5)
            .text((d) => {return d});
    }

    updateStrikes() {
        window.centerAxis.selectAll('g').selectAll('rect')
            .attr('fill', (d) => {return this.strikesInclude(d, "#2B7A78", "none")})
            .style("cursor", (d) => {return this.strikesInclude(d, "pointer", "default")});

        window.centerAxis.selectAll('g').selectAll('text')
            .attr('fill', (d) => {return this.strikesInclude(d, "white", "black")})
            .style("cursor", (d) => {return this.strikesInclude(d, "pointer", "default")});
    }

    strikesInclude(strike, yes, no) {
        if (window.active.optionStrikes.includes(strike)) { return yes } else { return no }
    }

    onStrikeClick(strike) {
        if (!(window.active.optionStrikes.includes(strike))) {
            return;
        }
        window.active.strike = strike;
        window.active.modal = true;
        api.subscribe(window.active.option, window.active.strike);

        let name = window.active.option + '-' + window.active.strike;
        d3.select("#modal-title-custom").text(name);
        d3.select("#myModal").style('display', 'block');
    }
}

export const axes = new Axes();
