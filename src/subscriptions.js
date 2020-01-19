"use strict";

export default class Subscriptions {
    constructor() {
        this.orderbook = {};
        this.quotes = ['bids', 'asks'];
    }

    parseChannel(channel) {
        return channel.replace('book.','').replace('.100ms','');
    }

    register(result) {
        for (let el of result) {
            el = this.parseChannel(el);
            if (el in this.orderbook) {
                console.log('Already subscribed to ', el);
            } else {
                this.orderbook[el] = {};
            }
        }
    }

    updateOrderbook(channel, data) {
        if (!(channel in this.orderbook)) {
            console.log('Recieved data from unknown subscription');
            return;
        }
        let level = this.orderbook[channel];
        if (data['type'] == 'snapshot') {
            this.addOrderbookSnapshot(level, data);
        } else if (data['type'] == 'change') {
            this.changeOrderbook(level, data);
        }

        if (window.active.modal) {
            this.createOrderbookDisplayMatrix(channel);
            let event = new CustomEvent('updateModal', {detail: channel});
            window.dispatchEvent(event);
        }
    }

    addOrderbookSnapshot(level, data) {
        level['id'] = data['change_id'];

        for (let q of this.quotes) {
            level[q] = [];
            for (let j in data[q]) {
                let price = data[q][j][1];
                let amount = data[q][j][2];
                level[q].push([price,amount]);
            }
        }
    }

    changeOrderbook(level, data) {
        if (data['prev_change_id'] == level['id']) {
            level['id'] = data['change_id'];
        } else {
            error('Missing orderbook changes');
        }
        for (let q of this.quotes) {
            for (let j in data[q]) {
                let action = data[q][j][0];
                let price = data[q][j][1];
                let amount = data[q][j][2];

                if (action == 'new') {
                    level[q].push([price,amount]);
                    continue;
                }

                if (action == 'delete') {
                    for (let k in level[q])
                        if (price == level[q][k][0]) {
                            level[q].splice(k, 1);
                            break;
                        }
                    continue;
                }

                // Change entry
                if (action == 'change') {
                    for (let k in level[q])
                        if (price == level[q][k][0]) {
                            level[q][k][1] = amount;
                            break;
                        }
                    continue;
                }
            }
        }
        level['bids'] = level['bids'].sort(function(a,b){return a[0] - b[0];}).reverse();
        level['asks'] = level['asks'].sort(function(a,b){return a[0] - b[0];});
    }

    createOrderbookDisplayMatrix(channel) {
        let level = this.orderbook[channel];
        let displayMatrix = [];
        let totalBid = 0,
            totalBidPadded,
            bidSize,
            bidSizePadded,
            bidPrice,
            askPrice,
            askSize,
            askSizePadded,
            totalAsk = 0,
            totalAskPadded;

        for (let i = 0; i < 6; i++) {
            if (level['bids'][i] !== undefined) {
                bidPrice = level['bids'][i][0].toFixed(4);
                bidSize = level['bids'][i][1];
                totalBid = totalBid + bidSize;
                //totalBid = +(totalBid + bidSize).toFixed(12); //hack
                bidSizePadded = bidSize.toFixed(1);
                totalBidPadded = totalBid.toFixed(1);
            } else {
                bidPrice = '-';
                bidSizePadded = '-';
                totalBidPadded = '-';
            }

            if (level['asks'][i] !== undefined) {
                askPrice = level['asks'][i][0].toFixed(4);
                askSize = level['asks'][i][1];
                totalAsk = totalAsk + askSize;
                //totalAsk = +(totalAsk + askSize).toFixed(12); //hack
                askSizePadded = askSize.toFixed(1);
                totalAskPadded = totalAsk.toFixed(1);
            } else {
                askPrice = '-';
                askSizePadded = '-';
                totalAskPadded = '-';
            }
            displayMatrix.push([totalBidPadded, bidSizePadded, bidPrice, askPrice, askSizePadded, totalAskPadded]);
        }
        this.orderbook[channel]['display'] = displayMatrix;
    }
}
