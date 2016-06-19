'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,
  active: false,
  editorsDisposable: null,
  editorsChangeDisposables: {},

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'diffhistory:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.editorsDisposable.dispose();
    for (value in this.editorsChangeDisposables) {
      this.editorsChangeDisposables[value].dispose();
    };
  },

  serialize() {
    return {

    };
  },

  toggle() {
    console.log('Diffhistory was toggled!');

    if(this.active) {
      for (value in this.editorsChangeDisposables) {
        this.editorsChangeDisposables[value].dispose();
        delete this.editorsChangeDisposables[value];
      };
      this.active = false;
    } else {

      var rest = require('rest'),
      mime = require('rest/interceptor/mime'),
      client = rest.wrap(mime);

      var self = this;
      this.editorsDisposable = atom.workspace.observeTextEditors(function(editor) {
        console.log(editor.id);
        self.editorsChangeDisposables[editor.id] = editor.onDidStopChanging(function(event) {
          filepath = editor.getPath();
          console.log(filepath);
          var d = new Date().toISOString();

          var changes = [];
          for (change in event.changes) {
            changes.push({"timestamp": d, "path": filepath, "newtext":event.changes[change].newText});
          }

          for (change in changes) {
            client({ path: 'http://localhost:3000/changes', entity: changes[change], headers: {
                'Content-Type': 'application/json'
            } }).then(function(response) {
                console.log('response: ', response);
            });
          }
        });
      });
      this.active = true;
    }
    console.log(this.editorsChangeDisposables);
  }

};
