mootools-autocompletion
=======================

Autocompletion made easy with Mootools, JavaScript, CSS, Less

Frontend: 
Load js and css / less file. 
If DOM is ready, init the autocompletion for each input element:
new Autocomplete($('myInputForAutocompletion'), 'myKey');
The Post-Request contains e.g. 
field=artist
search=die

The result must be JSON and have this format:

{
  "message": "Here comes the auto completion for \"die\""
  ,"status": "200",
  "error": "false",
  "data":[
    {"field": "Bombardiers"},
    {"field": "Die Alliierten"},
    {"field": "Die \u00c4rzte"}
  ]
}

