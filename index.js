'use strict';
// const express = require('express');
const restify = require('restify');
const fs = require('fs');

const Server = require('./static');

new Server({}).start(3001);

