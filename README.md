# spelunker()

[On GitHub](https://github.com/Jeff-Russ/spelunker-node-shelljs)

## Rapid Shell Executioner for Node.js using shelljs

`spelunker()` sends your guy into the shell and brings back the goods quicker than going in and out for each command. Populate an object (first argument is quoted string of object's name) with the results of many shell commands, stored in another object (second argument), without starting a slow sub-shell for each command. spelunker goes in and gathers all results in shell variables and echoes them all out as JS syntax as fodder for eval() to execute and add to your object (first arg). spelunker only makes one trip into the shell/cave to do all of it's gathering of data so it's faster! (you must `require('shelljs/global')`)  

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
## Under the Hood 

Here is what the above example sends to the shell:  

```javascript
sys_user="resultsObj.sys_user = "\""$(id -F || id -un || whoami || git config user.name || '')"\""; "
git_email="resultsObj.git_email = "\""$(git config user.email || '')"\""; "
author="resultsObj.author = "\""$(git config user.name || id -F || id -un || whoami || '')"\""; "
echo "$sys_user""$git_email""$author"
```

The escaped quotes will finally be rendered in the final statement which echoes this out:  

```javascript
resultsObj.sys_user = "Jeffrey Russ";
resultsObj.git_email = "jeffreylynnruss@gmail.com";
resultsObj.author = "Jeff-Russ"; 
```
Look familiar? It's just Javascript. spelunker then runs this with `eval()` which saves to the object!  
