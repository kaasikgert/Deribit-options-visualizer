"use strict";

export default class Instruments {
    constructor() {
        this.option = {};
        this.future = {};
        this.sorted = {};
        this.intervals = [
            {value: 1, display: '1 min'},
            {value: 3, display: '3 min'},
            {value: 5, display: '5 min'},
            {value: 15, display: '15 min'},
            {value: 30, display: '30 min'},
            {value: 60, display: '1 h'},
            {value: 120, display: '2 h'},
            {value: 180, display: '3 h'},
            {value: 360, display: '6 h'},
            {value: 720, display: '12 h'},
            {value: '1D', display: '1 day'}
            ];
    }

    parse(result) {
        for (let el of result) {
            let splitName = el['instrument_name'].split('-');
            let name = splitName[0] + '-' + splitName[1];
            let kind = el['kind'];

            if (!(name in this[kind])) {
                this[kind][name] = {};
                this[kind][name]['creation'] = el['creation_timestamp'];
                this[kind][name]['expiration'] = el['expiration_timestamp'];

                if (kind == 'option') {
                    this[kind][name]['strikes'] = [];
                }
            }

            if (kind == 'option') {
                let strike = el['strike'];
                this[kind][name]['strikes'].push(strike);
            }
        }
    }

    sortByDate(kind) {
        let keyValues = [];
        for (let key in this[kind]) {
            keyValues.push([ key, this[kind][key]['expiration'] ]);
        }

        let sortedList = [];
        keyValues.sort(function compare(kv1, kv2) {return kv1[1] - kv2[1];});
        for (let el of keyValues) {
            sortedList.push({value: el[0], display: el[0]});
        }
        this.sorted[kind] = sortedList;
    }

}
