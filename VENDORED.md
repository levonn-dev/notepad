# Vendored Dependencies

Third-party libraries under `vendor/` are included verbatim from their upstream releases. The project's own license (`LICENSE`, MIT) does not cover these — each library retains its own license as listed below.

| Library         | Path                 | Version                                  | License      | Upstream                                              |
|-----------------|----------------------|------------------------------------------|--------------|-------------------------------------------------------|
| Ace             | `vendor/ace/`        | unknown (not readable from bundle header) | BSD-3-Clause | https://ace.c9.io/                                    |
| Bootstrap       | `vendor/bootstrap/`  | 2.3.2                                    | Apache 2.0   | https://getbootstrap.com/2.3.2/                       |
| CodeMirror      | `vendor/codemirror/` | 5.10.0                                   | MIT          | https://codemirror.net/                               |
| Firebase JS SDK | `vendor/firebase/`   | ~7.6.2 (compat bundle)                   | Apache 2.0   | https://firebase.google.com/docs/web/setup            |
| Firepad         | `vendor/firepad/`    | unknown (upstream archived; last release 1.5.10) | MIT | https://github.com/FirebaseExtended/firepad           |
| jQuery          | `vendor/jquery/`     | 1.9.1                                    | MIT          | https://jquery.com/                                   |

## Notes

- **Firepad is archived** upstream (no longer maintained). The vendored copy is pinned to what shipped with this fork and cannot be meaningfully updated — substituting a different version risks breaking compatibility with the specific CodeMirror/Firebase versions it was tuned for.
- **Firepad + CodeMirror are version-locked as a pair.** If you update either, audit both.
- **Firebase JS SDK** in this repo is the full compat bundle, not the modular v9+ SDK. Firepad's API targets the compat surface only.
- **Local modification:** `vendor/firepad/firepad.css` has a single intentional edit — the `@font-face` block referencing `firepad.eot` was removed because that file is not bundled here. The following `@font-face` block inlines the WOFF and TTF as base64 data URLs, which is what modern browsers actually use to render toolbar icons.
