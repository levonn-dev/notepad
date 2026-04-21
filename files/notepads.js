var notepads = {
  'richtext' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, { lineWrapping: true, mode: '' });

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true });

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setHtml(
            '<span style="font-size: 24px;">Rich-text editing.</span><br/>\n' +
            '<div style="font-size: 14px">' +
            'Supports:<br/>' +
            '<ul>' +
              '<li>Different ' +
                '<span style="font-family: impact">fonts,</span>' +
                '<span style="font-size: 24px;"> sizes, </span>' +
                '<span style="color: blue">and colors.</span>' +
              '</li>' +
              '<li>' +
                '<b>Bold, </b>' +
                '<i>italic, </i>' +
                '<u>and underline.</u>' +
              '</li>' +
              '<li>Lists' +
                '<ol>' +
                  '<li>One</li>' +
                  '<li>Two</li>' +
                '</ol>' +
              '</li>' +
              '<li>Undo / redo</li>' +
              '<li>Cursor / selection synchronization.</li>' +
              '<li>Fully collaborative.</li>' +
            '</ul>' +
            '</div>');
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
    }
  },
  'code' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, {
        lineNumbers: true,
        mode: 'javascript'
      });

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror);

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setText('// JavaScript.\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
    }
  },
  'ace' : {
      create: function(div, ref) {
          var editor = ace.edit(div);
          editor.$blockScrolling = Infinity;
          editor.setTheme("ace/theme/textmate");
          var session = editor.getSession();
          session.setUseWrapMode(true);
          session.setUseWorker(false);
          session.setMode("ace/mode/javascript");

          this.firepad = Firepad.fromACE(ref, editor);

          var self = this;
          this.firepad.on('ready', function() {
                  if (self.firepad.isHistoryEmpty()) {
                      self.firepad.setText('// JavaScript.\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
                  }
              });
      },
      dispose: function() {
          this.firepad.dispose();
      }
  },
  'userlist' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, { lineWrapping: true, mode: '' });

      var userId = firebase.auth().currentUser.uid;

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true, userId: userId});

      this.firepadUserList = FirepadUserList.fromDiv(ref.child('users'), div, userId, userId);

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setText('Check out the user list to the left!');
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
      this.firepadUserList.dispose();
    }
  }
};

var currentId;
var authInitialized = false;
$(window).on('ready', function() {
  firebase.initializeApp(firebaseConfig);

  var $gate = $('<div id="signin-gate"><button id="signin-btn">Sign in with Google</button></div>').prependTo('#notepads-container');
  var $bar = $('<div id="signout-bar"><span id="signin-email"></span><button id="signout-btn">Sign out</button></div>').hide().appendTo('body');

  $('#signin-btn').on('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error) {
      console.log('sign-in error:', error);
      $gate.find('.signin-error').remove();
      $gate.append('<div class="signin-error">' + (error.message || error.code) + '</div>');
    });
  });

  $('#signout-btn').on('click', function() {
    firebase.auth().signOut().then(function() {
      window.location.reload();
    });
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('signed in as', user.email, user.uid);
      $gate.hide();
      $('#signin-email').text(user.email);
      $bar.show();
      firebase.database().ref('notepads').limitToFirst(1).once('value').then(function() {
        $('body').addClass('authorized');
        $bar.find('.no-access').remove();
        if (!authInitialized) {
          for (var notepad in notepads) {
            addClickHandler(notepad);
          }
          initializeNotepadsFromUrl();
          setTimeout(function() {
            $(window).on('hashchange', initializeNotepadsFromUrl);
          }, 0);
          authInitialized = true;
        }
      }).catch(function(err) {
        console.log('db access denied:', err && err.code);
        $('body').removeClass('authorized');
        $bar.find('.no-access').remove();
        $bar.prepend('<span class="no-access">No database access. </span>');
      });
    } else {
      console.log('signed out');
      $gate.show();
      $bar.hide();
      $('body').removeClass('authorized');
    }
  });
});


function initializeNotepadsFromUrl() {
  var info = getNotepadAndIdFromUrl();
  var newId = info.id || randomString(10);
  if (newId !== currentId) {
    currentId = newId;
    initializeNotepads(currentId);
  }

  var notepad = (notepads[info.notepad] != null) ? info.notepad : '';
  scrollToNotepad(notepad);

  window.location = './#' + notepad + '-' + currentId;
}

function getNotepadAndIdFromUrl() {
  var hash = window.location.hash.replace(/#/g, '') || '';
  var parts = hash.split('-');
  return { notepad: parts[0], id: parts[1] };
}

var initialized = false;
function initializeNotepads(id) {
  var ref = firebase.database().ref('notepads').child(id);
  for(var notepad in notepads) {
    var $div = $('#' + notepad + ' .notepad-container');
    if (initialized) {
      notepads[notepad].dispose();
      $div.empty();
    }

    notepads[notepad].create($div.get(0), ref.child(notepad));
  }
  initialized = true;
}

function addClickHandler(notepad) {
  $('#' + notepad + '-link').on('click', function() {
    window.location = './#' + notepad + '-' + currentId;
    return false;
  });
}

function scrollToNotepad(notepad) {
  if (notepad) {
    var scrollTo = notepad ? ($('#' + notepad).offset().top - 20) : 0;
    $('html, body').scrollTop(scrollTo);
  }
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
