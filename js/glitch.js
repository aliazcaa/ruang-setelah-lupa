// Glitches the BROWSER TAB TITLE (document.title) between your name
// and each practice label, using the given character set for the
// transition noise. The tab title is plain text only — no colors or
// HTML — so this updates the string directly rather than markup.
(function () {
  // Note: the double quote is escaped (\") so it doesn't end the string early.
  var CHARS = "`~!@$%^&*()_-+={}[]|\\:;\"',.<>?/";

  // Edit this list to change what the tab title cycles through.
  var PHRASES = [
    "ruang setelah lupa",
    "ɐdnl ɥɐlǝʇǝs ɓuɐnɹ",
    "ᵣᵤₐₙg ₛₑₜₑₗₐₕ ₗᵤₚₐ",
    "rµåñg §ê†êlåh lµþå",
    "r̶u̶a̶n̶g̶ ̶s̶e̶t̶e̶l̶a̶h̶ ̶l̶u̶p̶a̶",
    "r̷u̷a̷n̷g̷ ̷s̷e̷t̷e̷l̷a̷h̷ ̷l̷u̷p̷a̷",
    "ŗ̶̖̦̯̞̫̭͈͓̜̿̔͋̏͑̀ǔ̵̖̗͌̇ä̴̞͎́̽̉̾̈́̔̊͘͝n̸̝̣̪̫͚̭͍͈̆́̇g̷͖̻̞͚͐͊̈́͝ ̷͙̣̰̮̏̓s̴͈̫̬̈̌̾͆̃̊̍̅è̶͈̠͖̔̂̔̚t̷̢̡͙͉͔̦̎̿̋͛̍̑̚ͅẽ̸̢̨͈̗̙̩͍̫͛̃̂̆̆̆͋̽̚l̵̛̗̲̥͓͈̺̓̃͗̈́̽̋̿̑͝a̴̩̼͇͆͋̍h̸̨̧̻̘̓̕͜ ̷̱̭̘̘̩͚̭͍̓̃̈͛̕͝ͅl̸̡͇̬͓̤̙̲̜̜̓͋̏̃̕u̷̙̎̍͗̈́͐̄̀͗̚̚p̶̱̩̲͒̓a̶̡̛̱̱̪͎̘͌͋̈́̏͋͝͝"
  ];

  var HOLD_MS = 1000;   // how long each phrase stays fully readable

  function scrambleTo(target, onDone) {
    // Array.from splits by whole characters, so emoji-style letters
    // don't get cut in half during the scramble.
    var current = Array.from(document.title);
    var targetChars = Array.from(target);
    var length = Math.max(current.length, targetChars.length);
    var startMs = [];
    var endMs = [];
    var scrambleChar = [];

    for (var i = 0; i < length; i++) {
      startMs[i] = Math.random() * 500;
      endMs[i] = startMs[i] + 300 + Math.random() * 500;
      scrambleChar[i] = null;
    }

    var animStart = null;
    var rafId = null;
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.title = target;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (onDone) onDone();
    }

    function handleVisibility() {
      // Tab just went to the background (or is already hidden) —
      // don't let a throttled timer leave the title half-scrambled.
      if (document.hidden) finish();
    }

    function step(timestamp) {
      if (document.hidden) { finish(); return; }
      if (animStart === null) animStart = timestamp;
      var elapsed = timestamp - animStart;

      var out = "";
      var complete = 0;

      for (var i = 0; i < length; i++) {
        var from = current[i] || "";
        var to = targetChars[i] || "";

        if (elapsed >= endMs[i]) {
          complete++;
          out += to;
        } else if (elapsed >= startMs[i]) {
          if (!scrambleChar[i] || Math.random() < 0.3) {
            scrambleChar[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          out += scrambleChar[i];
        } else {
          out += from;
        }
      }

      document.title = out;

      if (complete === length) finish();
      else rafId = requestAnimationFrame(step);
    }

    document.addEventListener("visibilitychange", handleVisibility);

    if (document.hidden) {
      finish(); // tab already backgrounded: jump straight to the target
    } else {
      rafId = requestAnimationFrame(step);
    }
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    // Respect the visitor's OS setting: no animation, just the name.
    document.title = PHRASES[0];
    return;
  }

  var counter = 0;
  function next() {
    scrambleTo(PHRASES[counter], function () {
      setTimeout(next, HOLD_MS);
    });
    counter = (counter + 1) % PHRASES.length;
  }

  next();
})();
