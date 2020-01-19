"use strict";

import {api} from './api.js';
import {chart} from './chart.js';
import {modal} from './modal.js';
import {axes} from './axes.js';

window.active = {option: null, optionStrikes: null, strike: null, future: null, interval: null, modal: false};

let futureDropdown = d3.select("#futureDropdown");
let intervalDropdown = d3.select("#intervalDropdown");
let optionDropdown = d3.select("#optionDropdown");
futureDropdown.on("change", onFutureDropdownChange);
intervalDropdown.on("change", onIntervalDropdownChange);
optionDropdown.on("change", onOptionDropdownChange);

api.ws.connected.then( () => {
    api.getInstruments().then( () => {
        setActiveInstruments();
        addToDropdown(futureDropdown, api.instruments.sorted['future'], window.active.future);
        addToDropdown(optionDropdown, api.instruments.sorted['option'], window.active.option);
        addToDropdown(intervalDropdown, api.instruments.intervals, window.active.interval);
        api.getOhlc().then( () => {
            chart.createChart();
        });
    });
});


function setActiveInstruments() {
    let localStorageFuture = localStorage.getItem('activeFuture');
    let savedInterval = localStorage.getItem('activeInterval');
    let localStorageOption = localStorage.getItem('activeOption');
    let savedFuture = null;
    let savedOption = null;

    for (let el of api.instruments.sorted['future']) {
        if (el['value'] == localStorageFuture) {
            savedFuture = localStorageFuture;
            break;
        }
    }

    for (let el of api.instruments.sorted['option']) {
        if (el['value'] == localStorageOption) {
            savedOption = localStorageOption;
            break;
        }
    }

    window.active.future = savedFuture || api.instruments.sorted['future'][0]['value'];
    window.active.interval = savedInterval || api.instruments.intervals[5]['value'];
    window.active.option = savedOption || api.instruments.sorted['option'][0]['value'];
    window.active.optionStrikes = api.instruments['option'][window.active.option]['strikes'];
}


function addToDropdown(selectElement, dictList, active) {
    selectElement.selectAll('option')
        .data(dictList)
        .enter()
        .append('option')
        .attr('value', d => d.value)
        .text(d => d.display);
    selectElement.node().value = active;
}


function onFutureDropdownChange() {
    window.active.future = futureDropdown.property('value');
    localStorage.setItem('activeFuture', window.active.future);
    chart.updateOHLC();
}


function onIntervalDropdownChange() {
    window.active.interval = intervalDropdown.property('value');
    localStorage.setItem('activeInterval', window.active.interval);
    chart.updateOHLC();
}


function onOptionDropdownChange() {
    window.active.option = optionDropdown.property('value');
    window.active.optionStrikes = api.instruments['option'][window.active.option]['strikes'];
    localStorage.setItem('activeOption', window.active.option);
    axes.updateStrikes();
    chart.updateChart();
}
