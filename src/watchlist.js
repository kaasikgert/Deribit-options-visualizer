"use strict";

import {api} from './api.js';

export default class WatchList {
    constructor() {
        window.addEventListener('updatePNL', () => this.updateWatchListTable() );
        this.options = [];
        this.total = {color: 'red', line: []};
    }

    add(instrument, strike, optionType, orderType, quantity) {
        let line = [];
        let color;
        if (optionType == 'C') {
            if (orderType == 'asks') {
                color = '#B2BABB';
            } else {
                color = '#B2BABB';
            }
        } else {
            if (orderType == 'asks') {
                color = '#B2BABB';
            } else {
                color = '#B2BABB';
            }
        }

        let option = {
            instrument,
            strike,
            optionType,
            orderType,
            quantity,
            color,
            line,
        };

        this.options.push(option);
        this.update([instrument, strike, optionType].join('-'));
    }

    remove(option) {
        let index = this.options.indexOf(option);
        if (index !== -1) this.options.splice(index, 1);
        api.unsubscribeUnnecessary();
        let event = new Event('updatePNL');
        window.dispatchEvent(event);
    }

    update(channel) {
        let [instrument1, instrument2, strike, optionType] = channel.split('-');
        let instrument = [instrument1, instrument2].join('-');
        for (let option of this.options) {
            if (option['strike'] == strike && option['optionType'] == optionType) {
                let [totalPrice, remainder] = this.calculateTotalPrice(option);
                option['totalPrice'] = totalPrice;
                option['remainder'] = remainder;
            }
        }
        let event = new Event('updatePNL');
        window.dispatchEvent(event);
    }

    calculateTotalPrice(option) {
        let {instrument, strike, optionType, orderType, quantity} = option;
        let channel = [instrument, strike, optionType].join('-');
        let totalPrice = 0;
        for (let [price, size] of this.subscriptions.orderbook[channel][orderType]) {
            if (size <= quantity ) {
                totalPrice += price*size;
                quantity -= size;
            } else {
                totalPrice += price*quantity;
                quantity = 0;
                break;
            }
        }
        return [(parseFloat(totalPrice.toFixed(12))), quantity];
    }

    calculateProfit(option, expPrice) {
        let {strike, optionType, orderType, quantity, totalPrice} = option;

        let absProfitUSD, absProfitBTC;
        let priceDiffUSD = 0;
        let relProfitBTC = 0;

        if (optionType == 'C') {
            if (strike < expPrice) {
                priceDiffUSD = expPrice - strike;
                relProfitBTC = priceDiffUSD/expPrice*quantity;
            }
        } else if (optionType == 'P') {
            if (expPrice < strike) {
                priceDiffUSD = strike - expPrice;
                relProfitBTC = priceDiffUSD/expPrice*quantity;
            }
        }

        if (orderType == 'asks') {
            absProfitBTC = -totalPrice + relProfitBTC;
        } else {
            absProfitBTC = totalPrice - relProfitBTC;
        }
        return absProfitBTC;
    }

    updatePNLlines(domain) {
        if (this.options.length == 0) {
            return [-1,1];
        }
        domain[0] = Math.floor(domain[0]/50)*50;
        domain[1] = Math.ceil(domain[1]/50)*50;
        let x2domain = [0, 0];
        this.total['line'] = [];

        for (let option of this.options) {
            option['line'] = [];
            for (let price = domain[0]; price <= domain[1]; price += 50) {
                let profit = this.calculateProfit(option, price);
                if (profit < x2domain[0]) { x2domain[0] = profit; } else if (profit > x2domain[1]) { x2domain[1] = profit; }
                option['line'].push([ price , profit ]);

                if (this.options.length > 1) {
                    let found = false;
                    for (let point of this.total['line']) {
                        if (price == point[0]) {
                            found = true;
                            point[1] += profit;
                            if (point[1] < x2domain[0]) { x2domain[0] = point[1]; } else if (point[1] > x2domain[1]) { x2domain[1] = point[1]; }
                            break;
                        }
                    }
                    if (!found) {
                        this.total['line'].push([ price , profit ]);
                    }
                }
            }
        }
        return x2domain;
    }

    updateWatchListTable() {
        let watchListTable = d3.select("#watchListTable");
        watchListTable.selectAll("*").remove();
        for (let option of api.watchList.options) {
            let row = watchListTable.append('tr');
            row.append('td').text(option['instrument'] + '-' + option['strike'] + '-' + option['optionType']);
            row.append('td').text(() => {if (option['orderType'] == 'asks') {return 'BUY'} else {return 'SELL'}});
            row.append('td').text(option['quantity']);
            row.append('td').text(option['remainder']);
            row.append('td').text(option['totalPrice']);
            row.append('td').append('span').attr('class', 'close1').html('&times;').on('click', () => api.watchList.remove(option));
        }
    }
}
