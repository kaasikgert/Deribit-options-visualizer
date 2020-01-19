"use strict";

import {api} from './api.js';
import {modal} from './modal.js';
import {size} from './size.js';
import {scales} from './scales.js';
import {ohlc} from './ohlc.js';
import {axes} from './axes.js';
import {crosshair} from './crosshair.js';

class Chart {
    constructor() {
        window.addEventListener('resize', () => this.updateChart() );
        window.addEventListener('updatePNL', () => this.updateChart() );
        }

    createChart() {
        size.update();
        this.createChartStructure();
        scales.create();
        axes.create();
        ohlc.update();
        crosshair.create();
        this.createOverlay();
        this.createZoom();
    }

    updateChart() {
        size.update();
        this.updateChartStructure();
        scales.update();
        ohlc.update();
        this.updateProfitData();
        axes.update();
    }

    updateOnZoom() {
        crosshair.update(d3.mouse(this.overlayLeft.node())[0], d3.mouse(this.overlayLeft.node())[1]);
        ohlc.update();
        this.updateProfitData();
        axes.update();
    }

    updateOHLC() {
        this.overlayLeft.node().__zoom.x = 0;
        this.overlayLeft.node().__zoom.y = 0;
        this.overlayLeft.node().__zoom.k = 1;
        ohlc.data = [];
        api.getOhlc().then( () => {
            scales.create();
            this.updateChart();
        });
    }

    createChartStructure() {
        this.svg = d3.select("#chart").append("svg").attr("width", size.totalWidth).attr("height", size.totalHeight);
        this.leftClip = this.svg.append("defs").append("clipPath").attr("id", "leftClip").append("rect").attr("width", size.leftWidth).attr("height", size.totalHeight);
        window.left = this.svg.append("g").attr("clip-path", "url(#leftClip)");
        this.rightClip = this.svg.append("defs").append("clipPath").attr("id", "rightClip").append("rect").attr("width", size.rightWidth+1).attr("height", size.totalHeight);
        window.right = this.svg.append("g").attr("clip-path", "url(#rightClip)").attr("transform", "translate(" + size.rightXpos + ",0)");
        this.center = this.svg.append("g").attr("transform", "translate(" + size.leftWidth + ",0)");
        window.overlayCenter = this.center.append("rect").attr("width", size.center).attr("height", size.height);
        this.centerAxisClip = this.center.append("defs").append("clipPath").attr("id", "centerAxisClip").append("rect").attr("width", size.center).attr("height", size.height);
        window.centerAxis = this.center.append("g").attr("clip-path", "url(#centerAxisClip)").attr("height", size.height);

        this.ohlcChartClip = window.left.append("defs").append("clipPath").attr("id", "ohlcChartClip").append("rect").attr("width", size.leftWidth).attr("height", size.height);
        this.ohlcChart = window.left.append("g").attr("clip-path", "url(#ohlcChartClip)");
        window.ohlcGrid = this.ohlcChart.append("g");
        this.ohlcContainer = this.ohlcChart.append('g');
        window.stemContainer = this.ohlcContainer.append('g');
        window.rectContainer = this.ohlcContainer.append('g');

        this.pnlChartClip = window.right.append("defs").append("clipPath").attr("id", "pnlChartClip").append("rect").attr("width", size.rightWidth).attr("height", size.height);
        this.pnlChart = window.right.append("g").attr("clip-path", "url(#pnlChartClip)");
        window.pnlGrid = this.pnlChart.append("g");
        this.pnlContainer = this.pnlChart.append('g');

        this.xAxisLine = this.svg.append('line').attr('x1', 0).attr('x2', size.totalWidth).attr('y1', size.height).attr('y2', size.height).attr("stroke-width", 1).attr("stroke", "black");
        this.yAxisLine1 = this.svg.append('line').attr('x1', size.leftWidth).attr('x2', size.leftWidth).attr('y1', 0).attr('y2', size.height).attr("stroke-width", 1).attr("stroke", "black");
        this.yAxisLine2 = this.svg.append('line').attr('x1', size.rightXpos+1).attr('x2', size.rightXpos+1).attr('y1', 0).attr('y2', size.height).attr("stroke-width", 1).attr("stroke", "black");
        this.resizeArrowContainer = this.center.append('g').attr("width", size.center).attr("height", 10).attr("transform", "translate(10, " + (size.height+5) + ")").style("cursor", "e-resize");
        this.resizeArrowContainer.append('image').attr('href', 'resize.png');

        let drag = d3.drag().on("drag", () => {
            let leftWidth = d3.mouse(this.svg.node())[0]-size.center/2;
            size.leftWidthMultiplier = leftWidth/size.totalWidth;
            if (size.leftWidthMultiplier < 0.2) { size.leftWidthMultiplier = 0.2; } else if (size.leftWidthMultiplier > 0.8) { size.leftWidthMultiplier = 0.8; }
            this.updateChart();
        });
        this.resizeArrowContainer.call(drag);
    }

    updateChartStructure() {
        this.svg.attr("width", size.totalWidth).attr("height", size.totalHeight);
        this.leftClip.attr("width", size.leftWidth).attr("height", size.totalHeight);
        this.rightClip.attr("width", size.rightWidth+1).attr("height", size.totalHeight);
        window.right.attr("transform", "translate(" + size.rightXpos + ",0)");
        this.center.attr("transform", "translate(" + size.leftWidth + ",0)");
        window.overlayCenter.attr("width", size.center).attr("height", size.height);
        this.centerAxisClip.attr("width", size.center).attr("height", size.height);
        window.centerAxis.attr("height", size.height);
        this.ohlcChartClip.attr("width", size.leftWidth).attr("height", size.height);
        this.pnlChartClip.attr("width", size.rightWidth).attr("height", size.height);
        this.overlayLeft.attr("width", size.leftWidth).attr("height", size.height);
        this.overlayLeftAxis.attr("width", size.leftWidth).attr("height", size.bottom).attr("y", size.height);
        this.overlayRight.attr("width", size.rightWidth).attr("height", size.height);
        this.xAxisLine.attr('x1', 0).attr('x2', size.totalWidth).attr('y1', size.height).attr('y2', size.height);
        this.yAxisLine1.attr('x1', size.leftWidth).attr('x2', size.leftWidth).attr('y1', 0).attr('y2', size.height);
        this.yAxisLine2.attr('x1', size.rightXpos+1).attr('x2', size.rightXpos+1).attr('y1', 0).attr('y2', size.height);
        this.resizeArrowContainer.attr("transform", "translate(10, " + (size.height+5) + ")");
    }

    updateProfitData() {
        let domain = scales.y.domain();
        let x2domain = api.watchList.updatePNLlines(domain);
        scales.x2.domain(x2domain).nice();
        this.updateProfitGraph();
    }

    updateProfitGraph() {
        let line = d3.line()
            .x( (d) => { return scales.x2(d[1]); })
            .y( (d) => { return scales.y(d[0]); });
        this.pnlContainer.selectAll("*").remove();

        for (let option of api.watchList.options) {
            this.pnlContainer.append("path")
                .attr("d", line(option['line']))
                .attr("fill", "none")
                .attr("stroke", option["color"])
                .attr("stroke-width", 2);
        }

        this.pnlContainer.append("path")
            .attr("d", line(api.watchList.total['line']))
            .attr("fill", "none")
            .attr("stroke", api.watchList.total['color'])
            .attr("stroke-width", 2);
    }

    createOverlay() {
        this.overlayLeft = window.left.append("rect")
            .attr("width", size.leftWidth)
            .attr("height", size.height)
            .attr('class', 'overlay')
            .attr('cursor', 'crosshair');

        this.overlayLeftAxis = window.left.append("rect")
            .attr("width", size.leftWidth)
            .attr("height", size.bottom)
            .attr("y", size.height)
            .attr('class', 'overlay')
            .attr('cursor', 'e-resize');

        window.overlayCenter
            .attr('class', 'overlay')
            .attr('cursor', 'n-resize');

        this.overlayRight = window.right.append("rect")
            .attr("width", size.rightWidth)
            .attr("height", size.height)
            .attr('class', 'overlay')
            .attr('cursor', 'crosshair');

        this.overlayLeft
            .on('mouseover', () => {
                crosshair.showLeft();
                crosshair.update(d3.mouse(this.overlayLeft.node())[0], d3.mouse(this.overlayLeft.node())[1]);
            })
            .on('mouseout', () => crosshair.hide() )
            .on('mousemove', () => {
                crosshair.update(d3.mouse(this.overlayLeft.node())[0], d3.mouse(this.overlayLeft.node())[1]);
            });

        this.overlayRight
            .on('mouseover', () => {
                crosshair.showRight();
                crosshair.update(d3.mouse(this.overlayRight.node())[0], d3.mouse(this.overlayRight.node())[1]);
            })
            .on('mouseout', () => crosshair.hide() )
            .on('mousemove', () => {
                crosshair.update(d3.mouse(this.overlayRight.node())[0], d3.mouse(this.overlayRight.node())[1]);
            });
    }

    createZoom() {
        const newZoom = (handler) => d3.xyzoom()
            .on("zoom", handler);

        this.xZoom = newZoom(this.updateOnZoomX.bind(this));
        this.yZoom = newZoom(this.updateOnZoomY.bind(this));
        this.xyZoom = newZoom(this.updateOnZoomXY.bind(this));

        this.overlayLeft.call(this.xyZoom);
        this.overlayLeftAxis.call(this.xZoom);
        window.overlayCenter.call(this.yZoom);
    }

    updateOnZoomX() {
        const t = d3.event.transform;

        if (t.y != 0 || t.ky != 1) {
            return this.overlayLeftAxis.call(this.xZoom.transform, this.newTransform(t.x, 0, t.kx, 1));
        }

        const xOld = d3.xyzoomTransform(this.overlayLeftAxis.node());
        const xyOld = d3.xyzoomTransform(this.overlayLeft.node());
        const xyNew = this.newTransform(t.x, xyOld.y, t.kx, xyOld.ky);

        scales.transformX(t);

        if (xyNew.x != xyOld.x || xyNew.kx != xyOld.kx) {
            this.overlayLeft.call(this.xyZoom.transform, xyNew);
        }

        this.updateOnZoom();
    }

    updateOnZoomY() {
        const t = d3.event.transform;
        if (t.x != 0 || t.kx != 1) {
            return window.overlayCenter.call(this.yZoom.transform, this.newTransform(0, t.y, 1, t.ky));
        }

        scales.transformY(t);

        const xyOld = d3.xyzoomTransform(this.overlayLeft.node());
        const xyNew = d3.xyzoomIdentity.translate(xyOld.x, t.y).scale(xyOld.kx, t.ky);

        if (xyNew.y != xyOld.y || xyNew.ky != xyOld.ky) {
            this.overlayLeft.call(this.xyZoom.transform, xyNew);
        }

        this.updateOnZoom();
    }

    updateOnZoomXY() {
        const t = d3.event.transform;
        scales.transformX(t);
        scales.transformY(t);

        const xOld = d3.xyzoomTransform(this.overlayLeftAxis.node());
        const yOld = d3.xyzoomTransform(window.centerAxis.node());
        if (xOld.x != t.x || xOld.kx != t.kx) {
            this.overlayLeftAxis.call(this.xZoom.transform, this.newTransform(t.x, 0, t.kx, 1));
        }
        if (yOld.y != t.y || yOld.ky != t.ky) {
            window.overlayCenter.call(this.yZoom.transform, this.newTransform(0, t.y, 1, t.ky));
        }

        this.updateOnZoom();
    }

    newTransform(x, y, kx, ky) {
        return d3.xyzoomIdentity.translate(x, y).scale(kx, ky);
    }

}

export const chart = new Chart();
