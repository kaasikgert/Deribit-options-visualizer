"use strict";

export default class Ws {
    constructor() {
        this.n = 1;
        this.promises = {};
        this.url = 'wss://www.deribit.com/ws/api/v2';
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = (msg) => this.onMessage(msg);
        this.connected = new Promise(resolve => {
            this.ws.onopen = (msg) => {
                resolve();
            };
        });

        setInterval(async () => {
            this.ping();
        }, 60000);
    }

    ping() {
        var msg = {"jsonrpc" : "2.0", "method" : "public/test","params" : {} };
        this.action(msg);
    }

    action(msg) {
        let id = this.n++;
        msg['id'] = id;

        return new Promise(resolve => {
            this.promises[id] = resolve;
            this.send(msg);
        });
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }

    onMessage(msg) {
        let res;
        try {
            res = JSON.parse(msg.data);
        } catch (err) {
            error('Error parsing', msg);
            return;
        }

        if (res['jsonrpc'] != '2.0') {
            error('Error data: ', res);
            return;
        }

        if ('method' in res && res['method'] == 'subscription') {
            let event = new CustomEvent('onSubsciption', {detail: res['params']});
            window.dispatchEvent(event);
            return;
        }

        if (!('id' in res)) {
            error('Error data: ', res);
            return;
        }

        let resolve = this.promises[res['id']];
        resolve(res['result']);
        delete this.promises[res.id];
    }
}
