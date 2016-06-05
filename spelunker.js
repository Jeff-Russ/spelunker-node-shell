#!/usr/bin/env node

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
  var output = exec(cmds_str, { silent: true }).stdout; // console.log(output)

  // this uses echoed output to populate temp resultsOb
  eval(output); // console.log(resultsOb)

  return resultsOb; 
};

(function(ob){ob.globalize = function(){
for(var p in ob)if(ob.hasOwnProperty(p))global[p]=global[p]||ob[p];};
for(var p in ob)if(ob.hasOwnProperty(p))module.exports[p] = ob[p];})(req);