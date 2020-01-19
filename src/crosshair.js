"use strict";

import {size} from './size.js';
import {scales} from './scales.js';

class Crosshair {
    constructor() {
        this.displayLeftXwidth = 80;
        this.displayLeftXheight = 25;
        this.displayRightXwidth = 65;
        this.displayRightXheight = 25;
        this.displayYwidth = 50;
        this.displayYheight = 21;
        this.btcSymbol = '&#8383;'
    }
    create() {
        this.crosshairLeft = window.left
            .append('g');

        this.lineLeftX = this.crosshairLeft
            .append('line')
            .attr('class', 'crosshair');

        this.lineLeftY = this.crosshairLeft
            .append('line')
            .attr('class', 'crosshair');

        this.displayLeftX = this.crosshairLeft
            .append('g')
            .style('display', 'none');

        this.displayLeftX
            .append('rect')
            .attr("class", "crosshairDisplay")
            .attr('width', this.displayLeftXwidth)
            .attr('height', this.displayLeftXheight);

        this.displayLeftXtext = this.displayLeftX
            .append('text')
            .attr("class", "crosshairText")
            .attr('x', this.displayLeftXwidth/2)
            .attr('y', this.displayLeftXheight/2);

        this.displayY = window.centerAxis
            .append('g')
            .style('display', 'none');

        this.displayY
            .append('rect')
            .attr("class", "crosshairDisplay")
            .attr('width', this.displayYwidth)
            .attr('height', this.displayYheight);

        this.displayYtext = this.displayY
            .append('text')
            .attr("class", "crosshairText")
            .attr('x', this.displayYwidth/2)
            .attr('y', this.displayYheight/2);

        this.crosshairRight = window.right
            .append('g');

        this.lineRightX = this.crosshairRight
            .append('line')
            .attr('class', 'crosshair');

        this.lineRightY = this.crosshairRight
            .append('line')
            .attr('class', 'crosshair');

        this.displayRightX = this.crosshairRight
            .append('g')
            .style('display', 'none');

        this.displayRightX
            .append('rect')
            .attr("class", "crosshairDisplay")
            .attr('width', this.displayRightXwidth)
            .attr('height', this.displayRightXheight);

        this.displayRightXtext = this.displayRightX
            .append('text')
            .attr("class", "crosshairText")
            .attr('x', this.displayRightXwidth/2)
            .attr('y', this.displayRightXheight/2);
    }

    update(mouseX,mouseY) {
        var mouseDate = scales.x.invert(mouseX);
        var mouseProfit = scales.x2.invert(mouseX);
        var mouseHeight = scales.y.invert(mouseY);
        var formatTime = d3.timeFormat("%e %b %H:%M");

        this.lineLeftX
            .attr('x1', scales.x(mouseDate))
            .attr('x2', scales.x(mouseDate))
            .attr('y1', 0)
            .attr('y2', size.height);

        this.lineLeftY
            .attr('x1', 0)
            .attr('x2', size.leftWidth)
            .attr('y1', scales.y(mouseHeight))
            .attr('y2', scales.y(mouseHeight));

        this.lineRightX
            .attr('x1', scales.x2(mouseProfit))
            .attr('x2', scales.x2(mouseProfit))
            .attr('y1', 0)
            .attr('y2', size.height);

        this.lineRightY
            .attr('x1', 0)
            .attr('x2', size.rightWidth)
            .attr('y1', scales.y(mouseHeight))
            .attr('y2', scales.y(mouseHeight));

        this.displayY
            .attr("transform", "translate(0," + (scales.y(mouseHeight)-this.displayYheight/2) + ")");

        this.displayLeftX
            .attr("transform", "translate(" + (scales.x(mouseDate)-this.displayLeftXwidth/2) + "," + size.height + ")");

        this.displayRightX
            .attr("transform", "translate(" + (scales.x2(mouseProfit)-this.displayRightXwidth/2) + "," + size.height + ")");

        this.displayYtext
            .text(Math.round(mouseHeight));

        this.displayLeftXtext
            .text(formatTime(mouseDate));

        this.displayRightXtext
            .html(this.btcSymbol + ' ' + mouseProfit.toFixed(4));
    }

    showLeft() {
        this.lineLeftX.style('display', 'block');
        this.lineLeftY.style('display', 'block');
        this.lineRightY.style('display', 'block');
        this.displayY.style('display', 'block');
        this.displayLeftX.style('display', 'block');
    }

    showRight() {
        this.lineLeftY.style('display', 'block');
        this.lineRightX.style('display', 'block');
        this.lineRightY.style('display', 'block');
        this.displayY.style('display', 'block');
        this.displayRightX.style('display', 'block');
    }

    hide() {
        this.lineLeftX.style('display', 'none');
        this.lineLeftY.style('display', 'none');
        this.lineRightX.style('display', 'none');
        this.lineRightY.style('display', 'none');
        this.displayY.style('display', 'none');
        this.displayLeftX.style('display', 'none');
        this.displayRightX.style('display', 'none');
    }
}

export const crosshair = new Crosshair();
