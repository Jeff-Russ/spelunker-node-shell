#!/usr/bin/env node

// https://github.com/Jeff-Russ/spelunker-node-shell

var req = {};

req.spelunker = function(cmdsOb, resultsOb) {
  var cmds_str, resultsOb = resultsOb || {}

  // add iterator method to cmdsOb
  cmdsOb.iter = function(fn) {
    for(var p in this) { if(this.hasOwnProperty(p) && p !== "iter") { fn(p); } }
  };
  // build cmds_str with contents of cmdObj using cmdObj.iter()
  cmdsOb.iter(function(prop) {
    cmds_str += prop+"=resultsOb."+prop+"\" = \"\"'$("+cmdsOb[prop]+")';\";\n";
  });
  cmds_str += 'echo '; // now we start the second part, echoing all back
  
  // second run of cmdObj.iter(), appending echo info:
  cmdsOb.iter(function(prop) { cmds_str += "\"$"+prop+"\\n\"";} ); // console.log(cmds_str)

  // run all commands, getting output:
  var output = require('child_process').execSync( cmds_str, {stdio:'pipe'})
                                       .toString().replace(/\n$/, '');

  // this uses echoed output to populate temp resultsOb
  eval(output); //console.log(resultsOb)

  // re-interpret types:
  cmdsOb.iter(function(prop) {
    // if isn't number string see if it's a boolean string. Make actual boolean
    if (isNaN(resultsOb[prop])) {
      if     (resultsOb[prop] === "true") { resultsOb[prop] = true;  }
      else if(resultsOb[prop] === "false"){ resultsOb[prop] = false; }
    }
    // if a number string, make an actual number
    else { resultsOb[prop] =  Number(resultsOb[prop]); }
  }); 

  return resultsOb; 
};

(function(ob){ob.globalize = function(){
for(var p in ob)if(ob.hasOwnProperty(p))global[p]=global[p]||ob[p];};
for(var p in ob)if(ob.hasOwnProperty(p))module.exports[p] = ob[p];})(req);