"use strict";

import {api} from './api.js';
import {size} from './size.js';
import {ohlc} from './ohlc.js';

class Scales {
    create() {
        this.orig_x = d3.scaleTime().domain(d3.extent(ohlc.data, function(d) { return d.date; }));
        this.orig_y = d3.scaleLinear().domain([d3.min(ohlc.data, function(d) { return d3.min([d.low, d.high, d.close, d.open]); }), d3.max(ohlc.data, function(d) { return d3.max([d.low, d.high, d.close, d.open]); })]).nice();
        this.x = this.orig_x;
        this.x2 = d3.scaleLinear().domain([-1, 1]);
        this.y = this.orig_y;
        this.update();
    }

    update() {
        this.orig_x.range([0, size.leftWidth]);
        this.orig_y.range([size.height, 0]);
        this.x.range([0, size.leftWidth]);
        this.x2.range([size.pnlMargin, (size.rightWidth-size.pnlMargin)]);
        this.y.range([size.height, 0]);
    }

    transformX(transform) {
        let step = this.orig_x(ohlc.data[1].date)-this.orig_x(ohlc.data[0].date);
        let xLimitRight = -size.leftWidth*transform['kx']+step*transform['kx'];
        let xLimitLeft = -this.orig_x(ohlc.data[1].date)*transform['kx'];

        if (transform['x'] < xLimitRight) {
            transform['x'] = xLimitRight;
        }

        if (xLimitLeft+size.leftWidth < transform['x']) {
            transform['x'] = xLimitLeft+size.leftWidth;
        }

        if (xLimitLeft < transform['x']) {
            let format = d3.timeFormat("%Q");
            api.getOhlc(format(ohlc.data[0]['date']) - 3600*1000);
        }

        this.x = transform.rescaleX(this.orig_x);
    }

    transformY(transform) {
        this.y = transform.rescaleY(this.orig_y);
        /*
        let filtered = ohlc.data.filter(d=>d.date > scales.x.domain()[0] && d.date < scales.x.domain()[1]);
        this.y = this.orig_y.copy();
        this.y.domain([d3.min(filtered, function(d) { return d3.min([d.low, d.high, d.close, d.open]); }), d3.max(filtered, function(d) { return d3.max([d.low, d.high, d.close, d.open]); })]).nice();
        */
    }
}

export const scales = new Scales();
