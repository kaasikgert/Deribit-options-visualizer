"use strict";

import {api} from './api.js';

class Modal {
    constructor() {
        window.addEventListener('updateModal', (e) => this.updateOrderbook(e.detail), false);
        document.getElementById('quantityInput').addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9 \,.]/, '');
        });

        this.node = d3.select("#myModal");
        this.node.on('mousedown', () => { if (d3.event.target.id == 'myModal' || d3.event.target.id == 'closeModal') { this.closeModal(); } });
        this.quantityInput = d3.select("#quantityInput");
        this.quantityInput.on("input", () => this.updateModalTotalPrices() );
        let self = this;
        d3.selectAll(".orderButton").on("click", function() {self.addWatchList(this.dataset.optiontype, this.dataset.ordertype); });
    }

    updateOrderbook(channel) {
        let subChannelCall = window.active.option + '-' + window.active.strike + '-C';
        let subChannelPut = window.active.option + '-' + window.active.strike + '-P';
        let tableBody;
        if (channel == subChannelCall) {
            tableBody = d3.select("#orderBookCallTable");
        } else if (channel == subChannelPut) {
            tableBody = d3.select("#orderBookPutTable");
        } else {
            return;
        }

        let displayData = api.subscriptions.orderbook[channel]['display'];
        tableBody.selectAll('tr')
            .data(displayData)
            .selectAll('td')
            .data(d => d)
            .text(d => d);
        this.updateModalTotalPrices();
    }

    updateModalTotalPrices() {
        let quantity = this.getQuantityInput();
        let totalCallBid, totalCallAsk, totalPutBid, totalPutAsk, callBidRemainder, callAskRemainder, putBidRemainder, putAskRemainder;

        if (isNaN(quantity) || quantity < 0) {
            totalCallBid = '-';
            totalCallAsk = '-';
            totalPutBid = '-';
            totalPutAsk = '-';
        } else {
            [totalCallBid, callBidRemainder] = api.watchList.calculateTotalPrice({instrument: window.active.option, strike: window.active.strike, optionType: 'C', orderType: 'bids', quantity: quantity});
            [totalCallAsk, callAskRemainder] = api.watchList.calculateTotalPrice({instrument: window.active.option, strike: window.active.strike, optionType: 'C', orderType: 'asks', quantity: quantity});
            [totalPutBid, putBidRemainder] = api.watchList.calculateTotalPrice({instrument: window.active.option, strike: window.active.strike, optionType: 'P', orderType: 'bids', quantity: quantity});
            [totalPutAsk, putAskRemainder] = api.watchList.calculateTotalPrice({instrument: window.active.option, strike: window.active.strike, optionType: 'P', orderType: 'asks', quantity: quantity});
        }
        d3.select("#totalCallBidPrice").node().value = totalCallBid;
        d3.select("#totalCallAskPrice").node().value = totalCallAsk;
        d3.select("#totalPutBidPrice").node().value = totalPutBid;
        d3.select("#totalPutAskPrice").node().value = totalPutAsk;
    }

    getQuantityInput() {
        return parseFloat(this.quantityInput.node().value.replace(',', '.'));
    }

    addWatchList(optionType, orderType) {
        api.watchList.add(window.active.option, window.active.strike, optionType, orderType, this.getQuantityInput());
    }

    closeModal() {
        window.active.modal = false;
        this.node.style('display', 'none');
        this.quantityInput.node().value = '';
        d3.select("#totalCallBidPrice").node().value = '-';
        d3.select("#totalCallAskPrice").node().value = '-';
        d3.select("#totalPutBidPrice").node().value = '-';
        d3.select("#totalPutAskPrice").node().value = '-';
        api.unsubscribeUnnecessary();
    }

}

export const modal = new Modal();
