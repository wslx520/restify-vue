'use strict';
// const express = require('express');
const restify = require('restify');
const fs = require('fs');

const Server = require('./staticServer');

new Server({dir:'./static'}).start(3001);

