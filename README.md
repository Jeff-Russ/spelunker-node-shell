# spelunker()

[On GitHub](https://github.com/Jeff-Russ/spelunker-node-shelljs)

## Rapid Shell Executioner for Node.js using shelljs

`spelunker()` sends your guy into the shell and brings back the goods quicker than you going in and out for each command. Spelunker allows you to build up a list of shell commands to be executed all and once and store the results of each separately to an object you provide.  

Without having to start a new sub-shell for each command. spelunker goes in and gathers all results in shell variables and echoes them all out as JS syntax as fodder for eval() to execute and add to your object (first arg). spelunker only makes one trip into the shell/cave to do all of it's gathering of data so it's faster! (you must `require('shelljs/global')`)  

# WARNING

This little function uses `exec()` which executes raw strings as JavaScript without any sort of checking. To make thing even more of a risk, it's executing information handed back by the system's shell, effectively bursting the secure bubble that shields you Node environment from the OS. Spelunker was created for making an installer script run only by a developer on the a development machine and is not intended to live on a server or in a Node.js application.  

## The Function Definition

The first argument is the destination object. The destination object will be populated by all the results of the shell commands. It is passed to spelunker() as a context and will be appended/modified automatically. The second argument is an object filled with commands, where each key will the the property name created in the destination object. 

Here is the source:  

```javascript
spelunker = function(contextOb, commandsOb) {
  var spelunk = function(cmdsOb) {
    var cmd_string, output, prop;
    cmd_string = '';
    for (prop in cmdsOb) {
      if (cmdsOb.hasOwnProperty(prop)) {
        cmd_string += prop + "=this." + prop 
                   + "\" = \"\"'$("+ cmdsOb[prop] + ")'\n\";\n";
      }
    }
    cmd_string += 'echo ';
    for (prop in cmdsOb) {
      if (cmdsOb.hasOwnProperty(prop)) {
        cmd_string += "\"$" + prop + "\"";
      }
    }
    output = exec(cmd_string, {
      silent: true
    });
    output = output.stdout + output.stderr;
    eval(output);
    return this;
  };
  return spelunk.call(contextOb, commandsOb);
};
```

## CoffeeScript Version

```coffee
spelunker = (contextOb, commandsOb) ->
  spelunk = (cmdsOb) ->
    cmd_string = ''
    for own prop of cmdsOb
      cmd_string += "#{prop}=this.#{prop}\" = \"\"'$(#{cmdsOb[prop]})'\n\";\n"
    cmd_string += 'echo '
    for own prop of cmdsOb
      cmd_string += "\"$#{prop}\""
    output = exec(cmd_string, silent: true)
    output = output.stdout + output.stderr
    eval output
    return this
  spelunk.call contextOb, commandsOb
```

Note that the object described by the string in argument 1 must be in scope of the `spelunker()` script itself or else it will not be able to write to it and will throw an error. For this reason you should define `spelunker()` right in your code, after the object has be declared. It could be rewritten to accept a context or the object itself but it's probably a good idea not to put spelunker in an external file as a reusuable libray source anyway. This limitation this just enforces that. 

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

