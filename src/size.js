"use strict";

class Size {
    constructor() {
        this.bottom = 25;
        this.center = 50;
        this.pnlMargin = 20;
        this.leftWidthMultiplier = 0.5;
    }

    update() {
        let chartSize = document.getElementById('chart').getBoundingClientRect();
        this.totalWidth = Math.floor(chartSize.width);
        this.totalHeight = Math.floor(chartSize.height);
        this.height = this.totalHeight - this.bottom;
        this.leftWidth = Math.round(this.totalWidth*this.leftWidthMultiplier);
        this.rightXpos = this.leftWidth + this.center - 1;
        this.rightWidth = this.totalWidth - this.leftWidth - this.center;
    }
}

export const size = new Size();
