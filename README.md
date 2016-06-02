# spelunker()

[On GitHub](https://github.com/Jeff-Russ/spelunker-node-shelljs)

## Rapid Shell Executioner for Node.js using shelljs

`spelunker()` sends your guy into the shell and brings back the goods quicker than going in and out for each command. Populate an object (first argument is quoted string of object's name) with the results of many shell commands, stored in another object (second argument), without starting a slow sub-shells for each command. spelunker goes in and gathers all results in shell variables and echoes them all out as JS syntax as fodder for eval() to execute and add to your object (first arg). spelunker only makes on trip into the shell (cave) to do all of this so it's faster! (you must `require('shelljs/global')`)  

Here is the source:  

```javascript
exports.spelunker = function (resultsOb, commandsOb){
  var cmd_string = '';
  for(var propName in commandsOb) {
    cmd_string += propName + '="' + resultsOb + '.' + propName 
        + ' = "\\""$(' + commandsOb[propName] + ')"\\""; "\n';
  }
  cmd_string += 'echo '
  for(var propName in commandsOb) {
    cmd_string += '"$'+propName+'"';
  }
  var output = exec(cmd_string, { silent:true });
  output = output.stdout + output.stderr;
  eval(output);
}
```

## Example Use: 

```javascript
require('shelljs/global')

commandsObj = {
  sys_user: "id -F || id -un || whoami || git config user.name || ''",
  git_email: "git config user.email || ''",
  author: "git config user.name || id -F || id -un || whoami || ''",
}
resultsObj = {preexisting: "data will not be overwritten"};

exports.spelunker("resultsObj", commandsObj)

console.log(resultsObj);

// prints: 
// { preexisting: 'data will not be overwritten',
//   sys_user: 'Jeffrey Russ',
//   git_email: 'jeffreylynnruss@gmail.com',
//   author: 'Jeff-Russ' }
```
