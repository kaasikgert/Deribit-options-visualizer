"use strict";

import {ohlc} from './ohlc.js';
import Ws from './ws.js';
import Instruments from './instruments.js';
import Subscriptions from './subscriptions.js';
import WatchList from './watchlist.js';

class Api {
    constructor() {
        this.ws = new Ws();
        window.addEventListener('onSubsciption', (e) => this.onSubsciption(e.detail), false);
        this.instruments = new Instruments();
        this.subscriptions = new Subscriptions();
        this.watchList = new WatchList();
        this.watchList.subscriptions = this.subscriptions;
        this.orderbookDisplay = {};
        this.subscriptionCb;
    }

    onSubsciption(params) {
        if (params['channel'].includes('book.')) {
            let channel = this.subscriptions.parseChannel(params['channel']);
            this.subscriptions.updateOrderbook(channel, params['data']);
            this.watchList.update(channel);
        }
    }

    getInstruments() {
        return new Promise(resolve => {
            let msg = {
                "jsonrpc" : "2.0",
                "method" : "public/get_instruments",
                "params" : {
                    "currency" : "BTC",
                    "expired" : false
                }
            };
            this.ws.action(msg).then((result) => {
                this.instruments.parse(result);
                this.instruments.sortByDate('option');
                this.instruments.sortByDate('future');
                resolve();
            });
        });
    }

    calculateStartUnix(endUnix) {
        let interval = window.active.interval;
        if (interval == '1D') {interval = 1440;}
        let period = 1000*60*interval*200;
        return endUnix - period;
    }

    getOhlc(endUnix = Date.now()) {
        if (this.requestedUnix == endUnix) {
            return;
        }

        this.requestedUnix = endUnix;
        let interval = window.active.interval;
        if (interval == '1D') {interval = 1440;}
        let period = 1000*60*interval*200;
        let startUnix = endUnix - period;

        let msg = { "jsonrpc" : "2.0",
            "method" : "public/get_tradingview_chart_data",
            "params" : {
                "instrument_name" : window.active.future,
                "start_timestamp" : startUnix,
                "end_timestamp" : endUnix,
                "resolution" : window.active.interval,
            }
        };

        return new Promise((resolve, reject) => {
            this.ws.action(msg).then((result) => {
                if (result['status'] != 'ok' || result['ticks'].length == 0) {
                    reject(result);
                    return;
                }
                ohlc.parse(result);
                resolve();
            });
        });
    }

    subscribe(instrument, strike) {
        let call = 'book.' + instrument + '-' + strike + '-C.100ms';
        let put = 'book.' + instrument + '-' + strike + '-P.100ms';

        let msg = {
            "jsonrpc" : "2.0",
            "method" : "public/subscribe",
            "params" : {
                "channels" : [call, put]
            }
        };

        this.ws.action(msg).then((result) => {
            this.subscriptions.register(result);
        });
    }

    unsubscribe(instrument) {
        delete this.subscriptions.orderbook[instrument]

        let fullChannel = 'book.' + instrument + '.100ms';

        let msg = {
            "jsonrpc" : "2.0",
            "method" : "public/unsubscribe",
            "params" : {
                "channels" : [fullChannel]
            }
        };

        this.ws.action(msg).then((result) => {
            console.log('Unsubscribed channels: ', result);
        });
    }

    unsubscribeUnnecessary() {
        for (let channel in this.subscriptions.orderbook) {
            let included = false;

            for (let option of this.watchList.options) {
                let watchListChannel = option['instrument']+'-'+option['strike']+'-'+option['optionType'];
                if (channel == watchListChannel) {
                    included = true;
                }
            }
            if (!included) {
                this.unsubscribe(channel);
            }
        }
    }

}

export const api = new Api();
