# spelunker()

[On GitHub](https://github.com/Jeff-Russ/spelunker-node-shelljs)

## Rapid Shell Executioner for Node.js using shelljs

`spelunker()` sends your guy into the shell and brings back the goods quicker than going in and out for each command. Populate an object (first argument is quoted string of object's name) with the results of many shell commands, stored in another object (second argument), without starting a slow sub-shell for each command. spelunker goes in and gathers all results in shell variables and echoes them all out as JS syntax as fodder for eval() to execute and add to your object (first arg). spelunker only makes one trip into the shell/cave to do all of it's gathering of data so it's faster! (you must `require('shelljs/global')`)  

Here is the source:  

```javascript
exports.spelunker = function (resultsOb, commandsOb){
  var cmd_string = '';
  for(var propName in commandsOb) {
    if (commandsOb.hasOwnProperty(propName)) {
      cmd_string += propName + '="' + resultsOb + '.' + propName 
          + ' = "\\""$(' + commandsOb[propName] + ')"\\""; "\n';
    }
  }
  cmd_string += 'echo '
  for(var propName in commandsOb) {
    if (commandsOb.hasOwnProperty(propName)) {
      cmd_string += '"$'+propName+'"';
    }
  }
  var output = exec(cmd_string, { silent:true });
  output = output.stdout + output.stderr;
  eval(output);
}
```

## Example Use: 

```javascript
require('shelljs/global')

info = {
  caller_dir: pwd().stdout,
  to_dir: "./to",
  from_dir: "./from",
  def_from_dir: __dirname + "/appgen-templates/default",
  conf_file: 'appgen-config.sh'
};

commands = {
  to_dir: "cd " + info.to_dir + "; pwd",
  from_dir: "cd " + info.from_dir + "; pwd",
  sys_user: 'id -F || id -un || whoami || git config user.name || \'\'',
  git_email: 'git config user.email || \'\'',
  author: 'git config user.name || id -F || id -un || whoami || \'\'',
  to_dir_exists: "test -d " + info.to_dir + " && echo true || echo false",
  to_dir_empty: "test \"$(ls -A " + info.to_dir + ")\" && echo false || echo true",
  to_dir_has_git: "test -d " + info.to_dir + "/.git && echo true || echo false",
  to_dir_has_json: "test -f " + info.to_dir + "/package.json && echo true || echo false",
  to_dir_readme: "ls \"" + info.to_dir + "\" | grep -i readme || echo false",
  from_dir_exists: "test -d " + info.from_dir + " && echo true || echo false",
  from_dir_config: "test -f " + info.from_dir + "/" + info.conf_file + " && echo true || echo false"
};

spelunker("info", commands);
console.log(info);
```

this prints out:  

```bash
{ caller_dir: '/Users/Jeff/bin',
  to_dir: '/Users/Jeff/bin/to',
  from_dir: '/Users/Jeff/bin/from',
  def_from_dir: '/Users/Jeff/bin/appgen-templates/default',
  conf_file: 'appgen-config.sh',
  sys_user: 'Jeffrey Russ',
  git_email: 'jeffreylynnruss@gmail.com',
  author: 'Jeff-Russ',
  to_dir_exists: 'true',
  to_dir_empty: 'false',
  to_dir_has_git: 'true',
  to_dir_has_json: 'false',
  to_dir_readme: 'Readme.rdoc',
  from_dir_exists: 'true',
  from_dir_config: 'true' }
```
## Under the Hood 

Here is what the above example sends to the shell:  

```bash
to_dir=info.to_dir" = ""'$(cd ./to; pwd)'";
from_dir=info.from_dir" = ""'$(cd ./from; pwd)'";
# ... etc ...
echo "$to_dir""$from_dir""$sys_user""$git_email""$author"# ... etc ...
```

As you can see, it's creating shell variables and then echoing them all back out. Here is the echoed output:  

```javascript
info.to_dir = '/Users/Jeff/bin/to'
info.from_dir = '/Users/Jeff/bin/from'
info.sys_user = 'Jeffrey Russ'
info.git_email = 'jeffreylynnruss@gmail.com'
info.author = 'Jeff-Russ'
info.to_dir_exists = 'true'
info.to_dir_empty = 'false'
info.to_dir_has_git = 'true'
info.to_dir_has_json = 'false'
info.to_dir_readme = 'Readme.rdoc'
info.from_dir_exists = 'true'
info.from_dir_config = 'true'
```
Look familiar? It's just Javascript. spelunker then runs this with `eval()` which saves to the object!  


## CoffeeScript Version

Don't even bother trying some automatic convertion tool Coffeescript-ify this; the converter 
will have no idea that the output from the shell needs to be different since `eval` is now in 
coffeeland. Here it is in Coffeescript:  

```coffee
spelunker = (resultsOb, cmdsOb) ->
  cmd_string = ''
  for own prop of cmdsOb
    cmd_string += "#{prop}=#{resultsOb}.#{prop}\" = \"\"'$(#{cmdsOb[prop]})'\n\";\n"
  cmd_string += 'echo '
  for own prop of cmdsOb
    cmd_string += "\"$#{prop}\""
  output = exec(cmd_string, silent: true)
  output = output.stdout + output.stderr
  eval output
  return
```
