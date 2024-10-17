#!/bin/sh 

rm -rf node_modules ; rm yarn.lock ; yarn ; yarn db:initialize
