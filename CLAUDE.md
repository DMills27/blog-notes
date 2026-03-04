# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tale is a minimal Jekyll 4.x theme for storytellers, packaged as a Ruby gem (v0.2.1). It produces a static blog site with support for sidenotes, math rendering (MathJax), syntax highlighting (Highlight.js), hover popup annotations, reader highlight-comments (with localStorage persistence), and Anime.js v4 animations.

## Build & Development Commands

```bash
# Install dependencies
bundle install

# Build and serve locally (http://127.0.0.1:4000/)
bundle exec jekyll serve

# Build only (output to _site/)
bundle exec jekyll build
```

A Nix flake (`flake.nix`) is also available for reproducible builds on macOS (aarch64-darwin).

**Important:** `jekyll serve` only reads `_config.yml` once at startup. Changes to the config (e.g. `highlighter`, `kramdown` settings, `permalink`, `paginate`) will not take effect until the serve process is stopped and restarted.

## Architecture

### Content Flow

```
_posts/ + _pages/  →  _layouts/ (with _includes/)  →  _config.yml  →  _site/
```

### Layout Hierarchy

- **default.html** — Root HTML shell; loads head.html, navigation.html, footer.html, plus MathJax/Highlight.js/jQuery/custom scripts
- **home.html** — Extends default; paginated post listing
- **post.html** — Extends default; single post with metadata, tags, optional Disqus comments, prev/next navigation

### Styling

SCSS modules live in `_sass/tale/` with variables centralized in `_variables.scss`. Entry point is `assets/main.scss` → `tale.scss`. Mobile breakpoint at 600px. Output is compressed.

### JavaScript (`assets/js/`)

- **sidenotes.js** — Tufte-style sidenotes on desktop (≥ 600 px); falls back to standard footnote list on mobile. Supports rich footnote content: highlighted code blocks, images, and script-based animations via `cloneNode` + script re-execution. CSS in `_sass/tale/_sidenote.scss`.
- **highlight-code.js** — Syntax highlighting with line numbers via Highlight.js
- **popup-lite.js** — Rich hover popups triggered by `data-popup-title` on links; supports multiple concurrent popups, drag, pin, and Escape to close. CSS lives in `_sass/popup.scss`.
- **highlight-comments.js** — Medium-style reader annotations: select any text in `.post` to open a comment tooltip. Comments persist in `localStorage` keyed by pathname and are restored on reload. CSS lives in `_sass/highlight-comments.scss`.
- **anime.min.js** — Anime.js v4.3.6 UMD bundle (copied from `anime/dist/bundles/`). Exposes the global `anime` object; use inline `<script>` tags in post markdown to run animations.
- **disqusLoader.js** — Lazy-loads Disqus comments

### Key Configuration (`_config.yml`)

The `_config.yml` file is the central configuration for the Jekyll site. Jekyll reads it once at build time — changes require a restart of `jekyll serve`.

**Site metadata:**
- `title` — Site name displayed in navigation and `<title>` tags. Any string.
- `description` — Site description used by jekyll-seo-tag for `<meta>` tags. Any string.
- `url` — Production URL (e.g. `"https://example.com"`). Used for absolute URLs in feeds and SEO tags. Must include protocol, no trailing slash.
- `google_analytics` — GA tracking ID (e.g. `UA-XXXXXXXX-X` or `G-XXXXXXXXXX`). Omit or leave placeholder to disable.

**Author:**
- `author.name` — Author name shown in post metadata. Any string.
- `author.url` — Author homepage URL. Any valid URL.
- `author.email` — Author email. Used by jekyll-feed for the Atom feed.

**Build settings:**
- `markdown` — Markdown processor. Values: `kramdown` (default/recommended), `commonmark`. This site uses `kramdown`.
- `highlighter` — Server-side syntax highlighter. Values: `rouge` (Jekyll default), `none` (disabled — this site uses `none` because highlight.js handles highlighting client-side).
- `kramdown.input` — Parser mode. Values: `GFM` (GitHub Flavored Markdown — enables fenced code blocks, tables, strikethrough), `kramdown` (kramdown's own syntax).
- `kramdown.footnote_nr` — Starting number for footnotes. Integer, default `1`.
- `kramdown.syntax_highlighter` — Kramdown-level highlighter. Values: `rouge`, `coderay`, `none`. Set to `none` here to prevent kramdown from tokenizing code blocks (highlight.js does it client-side instead).

**File inclusion/exclusion:**
- `include` — List of directories/files to process that Jekyll would normally ignore (directories starting with `_`). e.g. `[_pages]`.
- `exclude` — List of files/directories to skip during build. Accepts an array. Note: if specified twice in the file, YAML keeps only the last occurrence.

**Assets:**
- `sass.sass_dir` — Directory containing SCSS partials. Default `_sass`.
- `sass.style` — CSS output style. Values: `compressed` (minified), `expanded` (readable), `nested`, `compact`.

**Plugins:**
- `plugins` — List of Jekyll plugins to load. Available plugins for this site:
  - `jekyll-feed` — Generates an Atom feed at `/feed.xml`
  - `jekyll-paginate` — Paginates the post listing on the home page
  - `jekyll-seo-tag` — Injects SEO `<meta>` tags and Open Graph data
  - `jemoji` — (commented out) Renders GitHub-style emoji shortcodes

**Permalinks & pagination:**
- `permalink` — URL pattern for posts. Common values: `/:year-:month-:day/:title` (this site), `/blog/:title/`, `/:categories/:title/`, `pretty` (`/:categories/:year/:month/:day/:title/`), `date` (default: `/:categories/:year/:month/:day/:title.html`).
- `paginate` — Number of posts per page on the home listing. Positive integer.

**Disqus:**
- `disqus` — Disqus shortname for comment embedding. Any string matching your Disqus site ID. Posts must also set `comments: true` in front matter to enable.

## Folder Structure

```
tale/
├── _config.yml         # Central Jekyll config (read once at build/serve startup)
├── _layouts/           # HTML layout templates
│   ├── default.html    #   Root shell: <html>, <head>, scripts, includes
│   ├── home.html       #   Paginated post listing (extends default)
│   └── post.html       #   Single post with metadata (extends default)
├── _includes/          # HTML partials pulled into layouts via {% include %}
│   ├── head.html       #   <head> tag: meta, CSS, fonts, favicon links
│   ├── navigation.html #   Top nav bar with site title + page links
│   ├── footer.html     #   Copyright footer
│   ├── analytics.html  #   Google Analytics snippet
│   └── disqus_comments.html  # Disqus lazy-load embed
├── _posts/             # Blog posts (YYYY-MM-DD-slug.md)
├── _pages/             # Static pages (about, posts index, tags)
├── _sass/              # SCSS source files
│   ├── tale.scss       #   Master import file — controls import order
│   ├── tale/           #   Core theme partials:
│   │   ├── _variables.scss  # Colors, fonts, mixins
│   │   ├── _base.scss       # Global resets, typography, links
│   │   ├── _layout.scss     # Content width (max-width: 800px, width: 80%)
│   │   ├── _post.scss       # Post title, metadata, body paragraph styles
│   │   ├── _code.scss       # Inline code and pre/code base styles
│   │   ├── _syntax.scss     # Rouge token colors (legacy, now unused)
│   │   ├── _sidenote.scss   # Tufte-style sidenote positioning
│   │   ├── _footnotes.scss  # Footnote section styles
│   │   ├── _navigation.scss # Nav bar layout
│   │   ├── _pagination.scss # Prev/next and page number controls
│   │   ├── _catalogue.scss  # Home page post listing items
│   │   └── _tags.scss       # Tag cloud and tag post listing
│   ├── custom/
│   │   └── highlight.scss   # Code block styles (hljs table, line numbers, labels)
│   ├── table.scss           # Data table borders and padding
│   ├── popup.scss           # Hover popup styles (.popup, .popup-titlebar, annotated link indicator)
│   └── highlight-comments.scss  # Highlight-comment styles (.hc-annotation, .hc-tooltip, etc.)
├── assets/
│   ├── main.scss       # SCSS entry point (just imports tale.scss)
│   ├── js/             # JavaScript files
│   │   ├── highlight-code.js      # hljs init + line numbers + language labels
│   │   ├── sidenotes.js           # Footnote → sidenote conversion (jQuery)
│   │   ├── popup-lite.js          # Hover popups via data-popup-* attributes
│   │   ├── highlight-comments.js  # Reader text annotations with localStorage persistence
│   │   ├── anime.min.js           # Anime.js v4.3.6 UMD bundle
│   │   └── disqusLoader.js        # Lazy Disqus loader
│   └── fonts/          # Self-hosted webfonts (Merriweather, Source Sans/Code Pro)
├── index.html          # Homepage (uses home layout with pagination)
├── _site/              # Generated output (do not edit, rebuilt on every build)
├── Gemfile             # Ruby dependencies
├── flake.nix           # Nix flake for reproducible builds
└── tale.gemspec        # Gem packaging spec
```

## Content Conventions

- Posts use `YYYY-MM-DD-slug.md` naming in `_posts/`
- Front matter requires `layout: post` and `title`; optional fields: `author`, `tags`, `comments` (boolean for Disqus)
- Pages go in `_pages/` with a `permalink` in front matter
- Inline math: `$...$`, display math: `$$...$$`
- Footnotes are auto-converted to sidenotes on wide screens

## Workflow: Creating and Iterating on a Post

1. Create a file in `_posts/` named `YYYY-MM-DD-your-slug.md`
2. Add front matter at the top:
   ```yaml
   ---
   layout: post
   title: "Your Title"
   author: "Your Name"
   tags: [tag1, tag2]
   ---
   ```
3. Write content in Markdown (GFM dialect: fenced code blocks, tables, strikethrough all work)
4. Run `bundle exec jekyll serve` — the site rebuilds automatically when you save any content or SCSS file (but NOT `_config.yml` — that requires a restart)
5. View at http://127.0.0.1:4000/ — hard refresh (Cmd+Shift+R) if CSS/JS changes don't appear

## Customisation Guide

### Changing content width and margins

Edit `_sass/tale/_layout.scss`. The content column is controlled by:
```scss
main, footer, .nav-container {
  max-width: 800px;   /* absolute cap */
  width: 80%;          /* responsive width below cap */
}
```
Change `max-width` to widen/narrow the column. Change `width` to control how much of the viewport it fills on smaller screens.

### Changing typography and colors

Edit `_sass/tale/_variables.scss`. All fonts and colors are defined as SCSS variables with `!default`, so they can be overridden. Key variables:
- `$serif-primary` — body text font
- `$sans-serif` — headings, UI elements
- `$monospaced` — code blocks
- `$default-color` — primary text color
- `$blue` — link color
- `$grey-1` through `$grey-3` — background tints

### Changing post body styles (paragraph layout, spacing)

Edit `_sass/tale/_post.scss`. The `.post` class wraps all post content. For example, to make paragraphs left-aligned instead of justified, change `text-align: justify` to `text-align: left` in `.post p`.

### Creating custom layouts (e.g. split intro + table of contents)

1. Create a new layout file in `_layouts/`, e.g. `_layouts/post-with-toc.html`
2. Set `layout: default` in its front matter to inherit the shell
3. Use HTML/Liquid to structure the page however you like — for a two-column split:
   ```html
   ---
   layout: default
   ---
   <div class="post" style="display: flex; gap: 2rem;">
     <div style="flex: 1;">{{ content | split: '<!-- toc-break -->' | first }}</div>
     <div style="flex: 1;"><!-- TOC or sidebar content --></div>
   </div>
   ```
4. Use `layout: post-with-toc` in the post's front matter to apply it

### Adding custom CSS

Two approaches:
- **For theme-wide changes:** add or edit a partial in `_sass/` and import it in `_sass/tale.scss` (files imported later override earlier ones)
- **For per-page CSS:** add a `<style>` block in the post's markdown (kramdown passes raw HTML through)

### Adding custom JavaScript

Two approaches:
- **Site-wide:** add your `.js` file to `assets/js/` and add a `<script>` tag in `_layouts/default.html` (at the end of `<body>`, after the existing scripts)
- **Per-page:** add a `<script>` block directly in the post's markdown, or use front matter flags (like the existing `include_stl_viewer_js`) checked in `_includes/head.html` to conditionally load scripts:
  ```yaml
  # In _includes/head.html, add:
  {% if page.include_my_script -%}
    <script src="{{ "/assets/js/my-script.js" | relative_url }}"></script>
  {% endif -%}
  ```
  Then set `include_my_script: true` in any post's front matter to load it.

### Script loading order

Scripts are loaded in two places (both run before the page is interactive):
1. **`_includes/head.html`** — jQuery, sidenotes, and conditional scripts (STL viewer)
2. **`_layouts/default.html`** (end of body) — MathJax, Highlight.js + line numbers plugin, highlight-code.js, popup-lite.js, highlight-comments.js

New scripts that depend on jQuery should go after the jQuery `<script>` tag. New scripts that manipulate post content should go at the end of `default.html` or use `DOMContentLoaded`.

---

## Sidenotes

Footnotes (written with standard kramdown `[^n]` / `[^n]:` syntax) are displayed in two modes depending on viewport width:

- **Desktop (≥ 600 px)** — footnotes are rendered as absolutely-positioned sidenotes to the right of the post column. The `.footnotes` section at the bottom is hidden.
- **Mobile (< 600 px)** — sidenotes are absent; the `.footnotes` section is shown as normal.

The breakpoint (600 px) matches the theme's mobile breakpoint defined in `_sass/tale/_variables.scss`.

### Jekyll integration

`sidenotes.js` is loaded synchronously in `_includes/head.html` (immediately after jQuery, which it depends on). All its work runs inside `$(window).on('load', …)`, which fires after `DOMContentLoaded` and after all end-of-body scripts in `default.html` have executed — including `highlight-code.js`. This ordering means that when sidenotes clone footnote content, syntax highlighting is already applied to any code blocks inside the footnotes.

### Mode switching

Mode is determined by `window.matchMedia('(min-width: 600px)')`. A `change` listener on that `MediaQueryList` fires whenever the viewport crosses the breakpoint, calling either `buildSidenotes()` or `destroySidenotes()`. This is more reliable and efficient than a polling `resize` listener.

**`buildSidenotes($footnotes, fnli)`**
1. Forces `.footnotes` to `display: block` for measurement (it may have been hidden by a prior desktop session).
2. For each `<sup>` element with a `#fn:` href, calls `showSidenote()` and pushes the returned record into `records`.
3. Sets `.footnotes` to `display: none`.

**`destroySidenotes($footnotes)`**
1. Iterates `records`, calling `clearInterval(rec.intervalId)` and `rec.$div.remove()` for each.
2. Clears the `records` array.
3. Sets `.footnotes` to `display: ''` (restores default block display).

Each sidenote record is `{ $div, intervalId }`. Storing the interval ID is essential for proper teardown — without it, the `setInterval(sizeit, 3000)` positioning loop would continue running against a removed element.

### Content cloning

`showSidenote()` uses `cloneNode(true)` (deep DOM clone) rather than the previous `innerHTML` round-trip. This preserves:

- **Highlighted code blocks** — all `<span class="hljs-*">` tokens and the line-number `<table class="hljs-ln">` structure are copied exactly.
- **Images** — `<img>` elements with all attributes and computed state.
- **Arbitrary HTML** — `<strong>`, `<em>`, `<a>`, `<ul>`, etc.

After cloning the `<li>`, `extractContent()` removes `.reversefootnote` / `.footnote-backref` links and returns a `DocumentFragment` of the remaining children.

### Ordinal header placement

The "1. " label is inserted as a `<span class="sidenote-header">` *inside* the first block-level element of the cloned content (`p`, `h2`–`h4`, `pre`, `ul`, `ol`, `blockquote`). This makes the number flow inline with the opening text at normal block display, removing the need for the old `p { display: inline }` CSS override which prevented code blocks and images from rendering as blocks.

### Script re-execution (`rerunScripts`)

Cloned `<script>` nodes are inert by the HTML spec — the browser does not re-execute them. `rerunScripts(container)` replaces each cloned `<script>` with a freshly created element (copying all attributes and text content) so the browser executes it. This allows footnotes to embed self-contained anime.js animations.

**ID conflict caveat for anime.js.** If an animation script uses `document.getElementById('my-id')`, it resolves to the *first* element with that ID in the document — the one in the post body, not the sidenote copy. Two elements with the same ID exist simultaneously, and the animation targets the wrong one.

The workaround is to scope the lookup to the last matching element rather than the first:

```js
// Instead of: document.getElementById('demo-wave')
var containers = document.querySelectorAll('.my-anim');
var el = containers[containers.length - 1]; // targets the most recently inserted copy
```

Animations that build their DOM entirely via `document.createElement` and capture the container reference in a closure are unaffected by this issue.

### Writing rich footnotes

**Code block in a footnote** (kramdown continuation syntax — 4-space or 1-tab indent):

```markdown
Here is the algorithm.[^1]

[^1]: This snippet illustrates it:

    ```python
    def hello():
        print("hello")
    ```
```

**Image in a footnote:**

```markdown
See the diagram.[^2]

[^2]: The layout:

    ![diagram](/assets/img/diagram.png)
```

**Anime.js animation in a footnote** (use class, not id, for the container):

```markdown
Watch this.[^3]

[^3]: A bouncing dot:

    <div class="fn-dot-demo" style="padding:1rem;"></div>

    <script>
    (function () {
      var els = document.querySelectorAll('.fn-dot-demo');
      var el = els[els.length - 1]; // target the sidenote copy
      var dot = document.createElement('span');
      dot.style.cssText = 'display:inline-block;width:12px;height:12px;border-radius:50%;background:#5ae;';
      el.appendChild(dot);
      anime.animate(dot, { y: -16, loop: true, alternate: true, duration: 500 });
    }());
    </script>
```

Note: `anime` must be loaded before the footnote's `<script>` runs. If the post already has `<script src="/assets/js/anime.min.js"></script>` in the body, that is sufficient — the bundle loads once and sets `window.anime`.

### CSS (`_sass/tale/_sidenote.scss`)

| Selector | Purpose |
|---|---|
| `.sidenote` | Absolute-positioned card; `font-size: 0.8em`; left border |
| `.sidenote-header` | Bold ordinal ("1. ") prepended to first block |
| `.sidenote-hover` | Orange highlight colour applied on `<sup>` hover |
| `.sidenote img` | `max-width: 100%; height: auto` — prevents image overflow |
| `.sidenote pre` | `max-width: 100%; overflow-x: auto` — scrollable wide code |
| `.sidenote code` | `white-space: pre-wrap` — wraps within the column |
| `.sidenote pre code` | `white-space: pre` — overrides wrap inside `<pre>` blocks |
| `.reversefootnote`, `.footnote-backref` | `display: none` — back-arrows hidden in sidenotes |

### Files

| File | Purpose |
|---|---|
| `assets/js/sidenotes.js` | All sidenote logic: mode switching, cloning, script re-execution, positioning |
| `_sass/tale/_sidenote.scss` | Sidenote CSS including rich-content overrides |

---

## Hover Popup Annotations

Popup annotations display a rich tooltip when the reader hovers a link. The system supports multiple concurrent popups, dragging, pinning, and keyboard dismissal.

### Authoring a popup link

Use Kramdown's inline attribute syntax `{: attr="value"}` immediately after the Markdown link:

```markdown
[Link text](https://url.com){:
  data-popup-title="Title shown in bar and body"
  data-popup-author="Author or source"
  data-popup-date="2024"
  data-popup-tags="tag1,tag2,tag3"
  data-popup-abstract="Body text. Plain text or HTML both work."
  data-popup-image="/path/to/image.jpg"
}
```

**Only `data-popup-title` is required** — its presence is what `popup-lite.js` uses to attach hover behaviour (`a[data-popup-title]`). All other attributes are optional; absent sections are simply omitted from the rendered popup.

| Attribute | Rendered as | Notes |
|---|---|---|
| `data-popup-title` | Title bar label + bold heading | Required |
| `data-popup-author` | Italic author span in meta line | Optional |
| `data-popup-date` | Date span in meta line | Optional |
| `data-popup-tags` | Tag pills linking to `/tags/<tag>` | Comma-separated |
| `data-popup-abstract` | Blockquote body | Plain text or HTML |
| `data-popup-image` | Preview image below abstract | URL |

### Popup behaviour

- **Trigger delay** — 750 ms hover before the popup appears (prevents accidental flashes).
- **Multiple popups** — hovering a second link opens a second popup without closing the first.
- **Drag** — grab the dotted title bar to reposition.
- **Pin** — click the 📌 button to keep a popup open after the cursor leaves.
- **Close** — click ✕, click outside all popups, or press Escape.
- **Click-to-show** — first click on a link shows the popup; second click navigates.

### Files

| File | Purpose |
|---|---|
| `assets/js/popup-lite.js` | All popup logic (vanilla JS, no dependencies) |
| `_sass/popup.scss` | All popup CSS; uses theme SCSS variables |

---

## Highlight Comments

Readers can select any text within a post body to open a comment tooltip. Annotations that receive at least one comment are saved to `localStorage` and restored on the next page load. No post markup is required.

### Jekyll integration

`highlight-comments.js` is loaded unconditionally from `_layouts/default.html` (end of `<body>`). Its `init()` function calls `document.querySelector('.post')` and silently returns if the element is absent, so it is a no-op on home, tag, and archive pages. CSS lives in `_sass/highlight-comments.scss`, imported at the end of `_sass/tale.scss` after all theme partials so it can freely override base styles.

### Selection lifecycle

When a reader makes a text selection and releases the mouse button, the following sequence runs synchronously:

1. **`mouseup` fires** — `window.getSelection()` is read. If the selection is collapsed (a bare click with no drag), the handler returns immediately.
2. **`isRangeWrapSafe(range)` validates** — the range is rejected if any of the following are true (see validation rules below). An invalid range clears the selection and returns.
3. **Lock acquired** — `isProcessing = true` is set synchronously before any DOM work, preventing re-entrant calls from a second rapid `mouseup`.
4. **Pre-validation** — `range.cloneContents().textContent.trim()` checks that the selection contains non-whitespace text *before* any DOM mutation. If empty, an error is thrown and the lock is released.
5. **Serialise** — `serializeRange(range.cloneRange())` records the position as a `blockIdx` + `textStart` pair (see Serialisation below) *before* the DOM is mutated.
6. **Wrap** — `wrapRange(range.cloneRange(), id)` calls `range.extractContents()` to lift the selected nodes into a `DocumentFragment`, appends a `<span class="hc-bubble">` sibling, wraps both in `<span class="hc-annotation">`, and reinserts with `range.insertNode()`. This preserves all inline formatting (`<em>`, `<strong>`, `<a>`, etc.) because `extractContents` moves the actual DOM nodes, not a text-only copy.
7. **Open tooltip** — `openTooltip(wrapper)` positions and fades in the comment UI.
8. **`suppressNextClick = true`** — set immediately after the tooltip opens to absorb the `click` event that browsers always fire after a `mouseup`. Without this flag the click handler would fire, see that its target (recorded at mousedown time, before the DOM mutation) is not inside `.hc-annotation`, and immediately call `closeTooltip()` — making the feature appear broken.
9. **Lock released** — `isProcessing = false` in the `finally` block.

### Range validation (`isRangeWrapSafe`)

All conditions must pass for a selection to become an annotation:

| Check | Why |
|---|---|
| Range is not collapsed | A bare click with no drag yields a zero-length range |
| `document.querySelector('.post')` exists | Guard for non-post pages |
| `post.contains(commonAncestorElement)` | Selection must be inside the post body |
| No ancestor in `EXCLUDED` list | Prevents annotating the post header, code blocks, existing highlights, or the open tooltip |
| `range.toString().trim()` is non-empty | Rejects whitespace-only selections |
| No `.hc-annotation` ancestor in live DOM | Catches selections fully inside an existing highlight — `cloneContents()` alone cannot detect this because the wrapping span lies outside the cloned fragment |
| `cloneContents()` fragment contains no `.hc-annotation` or block-level elements | Catches partial overlaps with existing annotations and cross-paragraph selections |

### Serialisation and restore

Because DOM positions (node references, offsets) are ephemeral, annotations are stored as **text-content character offsets** within a stable block element, computed by a `TreeWalker` over `TEXT_NODE`s.

**`serializeRange(range)` algorithm:**
1. Walk up from `range.startContainer` until a block element that appears in `getAnnotatableBlocks()` (`p, li, h2, h3, h4, blockquote` inside `.post`, excluding header/code areas) is found. Record its index as `blockIdx`.
2. Create a `TreeWalker` over that block's text nodes. Accumulate `charCount` per node until `walker.currentNode === range.startContainer`. At that point add `range.startOffset`. The total is `textStart`.
3. Store `{ blockIdx, textStart, textLength: range.toString().length, selectedText: range.toString() }`.

**`deserializeRange(record)` algorithm:**
1. Retrieve `blocks[blockIdx]`. If the block no longer exists, return `null`.
2. Walk its text nodes again, accumulating `charCount`. The start node is the first node where `charCount + nodeLength > textStart`; `startOff = textStart - charCount`. The end node is the first node where `charCount + nodeLength >= textStart + textLength`; `endOff = textStart + textLength - charCount`.
3. Construct a `Range`, then verify `range.toString() === selectedText`. If the check fails (post content was edited), return `null` — the annotation is silently skipped.

Because the walker sees all text nodes regardless of intermediate annotation spans, offsets remain correct even when earlier annotations in the same block have already been restored and added wrapper elements.

### Tooltip lifecycle

- **Open** — `openTooltip(annotationEl)` first calls `closeTooltip()` to dismiss any existing tooltip. The new tooltip is positioned with `position: fixed` at `rect.bottom + 6` / `rect.left` (no scroll offset — fixed elements are already in viewport coordinates). After appending, a `requestAnimationFrame` measures the tooltip's rendered dimensions and clamps it: if the right edge overflows it shifts left; if the bottom edge overflows it flips above the annotation.
- **Scroll / resize** — passive `scroll` and `resize` listeners call `repositionTooltip()`, which repeats the `getBoundingClientRect` + clamp logic on every frame.
- **Close** — `closeTooltip()` checks whether the annotation has zero comments and `committed === false`. If so, `unwrapAnnotation()` moves all non-bubble child nodes back to the parent in a `DocumentFragment` (preserving inline formatting) and removes the wrapper. If comments exist the highlight remains. The tooltip element is always removed.
- **`committed` flag** — set to `true` the first time a comment is posted. This prevents `closeTooltip()` from removing a highlight the user returns to later (even if they add no new comments on that visit).

### CSS class reference

| Class | Element | Purpose |
|---|---|---|
| `.hc-annotation` | `<span>` wrapping selected text | Blue tinted background + dashed underline; `position: relative` to anchor the bubble |
| `.hc-bubble` | `<span>` inside `.hc-annotation` | Comment count or 💬 icon; `opacity: 0`, revealed on `.hc-annotation:hover` |
| `.hc-tooltip` | `<div>` appended to `<body>` | `position: fixed` card; appears below the annotation |
| `.hc-comment` | `<div>` per comment | Flex row containing avatar + text |
| `.hc-avatar` | `<div>` | Circular initial badge; `background` set via `style.backgroundColor` (not innerHTML) |
| `.hc-comment-author` | `<div>` | Bold author name; set with `textContent` |
| `.hc-comment-text` | `<div>` | Comment body; set with `textContent` |
| `.hc-input` | `<textarea>` | New comment input; focus ring uses `$blue` |
| `.hc-post-btn` | `<button>` | Submit button; disabled until input is non-empty; `$blue` when enabled |

All colors reference SCSS variables from `_variables.scss` (`$blue`, `$grey-1`, `$grey-2`, `$grey-3`, `$white`, `$default-color`, `$default-shade`, `$shadow-color`, `$sans-serif`).

### Persistence

Records are saved under `localStorage` key `hc:<window.location.pathname>` as a JSON array. Only annotations with `comments.length > 0` are written. Each record:

```json
{
  "id": "uuid",
  "blockIdx": 2,
  "textStart": 47,
  "textLength": 12,
  "selectedText": "spacing effect",
  "comments": [
    { "author": "You", "color": "#5ae", "text": "Great point.", "timestamp": 1709500000000 }
  ]
}
```

On page load, `restoreAnnotations()` iterates the stored records, calls `deserializeRange`, validates with `isRangeWrapSafe`, then calls `wrapRange` to re-highlight. The `selectedText` sanity check ensures that if a post is edited and the text no longer exists verbatim, the stale annotation is dropped rather than mis-highlighting something else.

### Files

| File | Purpose |
|---|---|
| `assets/js/highlight-comments.js` | All logic: selection, validation, serialisation, tooltip, localStorage |
| `_sass/highlight-comments.scss` | All CSS: `.hc-annotation`, `.hc-bubble`, `.hc-tooltip`, comment rows, input |

---

## Anime.js Animations

Anime.js v4.3.6 is integrated as a static asset served from `assets/js/anime.min.js`. It is opt-in per post — not loaded globally — using a plain `<script>` tag in the post's markdown.

### Jekyll integration

**Why UMD, not ESM.** Anime.js ships two bundles: an ES-module build (`anime.esm.min.js`) and a UMD build (`anime.umd.min.js`). The UMD build was chosen because each `<script>` block in a post's markdown is a separate, classic-mode script that shares the same global scope. The UMD bundle assigns `window.anime = { animate, createTimeline, stagger, svg, … }`, so every subsequent `<script>` block on the same page can destructure from `anime` without any import statement. The ESM build would require `type="module"`, which creates an isolated module scope per block — the `anime` binding from a `<script type="module">` loader block would be invisible to other `<script type="module">` blocks on the page unless they each re-imported it.

**File location.** The original source lives in `anime/dist/bundles/anime.umd.min.js` (inside the `anime/` project folder in the repository root). A copy was placed at `assets/js/anime.min.js` so Jekyll serves it as a static asset at `/assets/js/anime.min.js`.

**Excluding the source folder.** The `anime/` folder contains `node_modules` and other non-web files. Jekyll would attempt to copy everything it finds that is not excluded, so `anime` was added to the `exclude` list in `_config.yml`:

```yaml
exclude: [ Gemfile, Gemfile.lock, tale.gemspec, anime, "untitled folder" ]
```

**Important:** `_config.yml` had two `exclude:` keys. YAML keeps only the last occurrence when the same key appears twice, so the addition was made to the *second* (last) `exclude` block. If a first block is visible in the file, it is silently ignored by Jekyll.

**Script loading.** The bundle is loaded synchronously (no `defer` or `async`) via a tag placed directly in the post markdown:

```html
<script src="/assets/js/anime.min.js"></script>
```

Kramdown passes raw HTML elements through to the output unchanged, so this tag appears verbatim in the rendered HTML. Because it is synchronous and inline, the browser fetches and executes the script before parsing any subsequent `<script>` block in the same post, guaranteeing that `window.anime` is defined by the time the animation code runs. No `DOMContentLoaded` listener or deferred execution is needed.

### Writing animation blocks

The recommended pattern is one `<script src="…">` at the top of the section, followed by individual `<script>` blocks per demo, each wrapped in an IIFE:

```html
<script src="/assets/js/anime.min.js"></script>

<div id="my-demo" style="display:flex; gap:12px; padding:2rem;">
  <!-- elements built in JS or authored in HTML -->
</div>

<script>
(function () {
  const { animate, stagger } = anime;
  animate('#my-demo span', {
    y: [-30, 0],
    ease: 'out(3)',
    duration: 600,
    delay: stagger(80),
  });
}());
</script>
```

**Why IIFEs.** Each animation demo may declare helper variables (`container`, `cells`, `colors`, etc.). Without an enclosing function scope those names become global and can collide between demos on the same page. An IIFE creates a private scope at zero cost.

### Animation property syntax

**From/to arrays.** Any animatable property accepts a `[from, to]` tuple instead of a bare target value. Anime.js jumps the element to `from` at the start of the animation and interpolates to `to`:

```js
scale: [0, 1]     // jump to 0, animate to 1
opacity: [0, 1]
y: [-30, 0]       // jump 30 px above, fall into place
```

A bare scalar (`scale: 0`) animates from the element's *current* value to `0` — useful in a second `.add()` call where the previous step already established the starting state.

**Easing strings.** Anime.js v4 uses a functional notation for easing curves:

| String | Meaning |
|---|---|
| `'out(3)'` | Ease-out with power 3 (strong deceleration) |
| `'in(2)'` | Ease-in with power 2 (moderate acceleration) |
| `'inOut(3)'` | Ease-in-out, symmetric, power 3 (smooth start and stop) |
| `'linear'` | No easing |
| `'spring(mass, stiffness, damping, velocity)'` | Physics-based spring |

The parenthesised number is the polynomial exponent — higher values produce a more dramatic ramp.

### `stagger` options

`stagger(baseDelay, opts)` returns a function that Anime.js calls with each element's index to produce a per-element `delay` value:

| Option | Type | Effect |
|---|---|---|
| `start` | number | Offset added to all computed delays (shifts the whole wave in time) |
| `from` | `'first'` / `'last'` / `'center'` / index | Reference point for delay calculation — `'center'` makes the middle element fire first, outer elements last |
| `grid` | `[cols, rows]` | Switches from linear (1-D index) to 2-D Manhattan / Euclidean distance from the `from` point; each element's delay is proportional to its grid distance |
| `axis` | `'x'` / `'y'` | When used with `grid`, compute distance along one axis only |
| `easing` | string | Apply an easing curve to the stagger spread itself (not the animation) |

**Example — grid ripple:** `stagger(55, { grid: [6, 6], from: 'center' })` assigns delays proportional to each cell's Euclidean distance from the centre of a 6×6 grid. The centre cells animate first; corner cells animate last, producing a ripple effect.

### Timeline API

`createTimeline(opts)` returns a timeline object. Animations are chained with `.add()` and the timeline is started with `.init()`:

```js
createTimeline({
  loop: true,        // repeat indefinitely
  loopDelay: 600,    // ms to pause between loop iterations (default: 0)
  defaults: { ease: 'inOut(3)', duration: 1000 },  // applied to every .add() unless overridden
})
.add(targets, props, timeOffset)   // timeOffset: ms from timeline start, or stagger fn
.add(targets, props, timeOffset)
.init();                            // required — starts playback
```

**`.add()` signature:**
- `targets` — any valid CSS selector string, DOM element, `NodeList`, or the return value of `svg.createDrawable()`.
- `props` — animation properties object; same syntax as `animate()`.
- `timeOffset` *(optional)* — absolute ms position within the timeline, or the return value of `stagger()` to stagger each element's start across the timeline.

**`.init()` is required.** Without it the timeline is constructed but never starts. This design lets you chain all `.add()` calls before any animation frame fires.

**`loopDelay`.** When `loop: true`, each complete pass through the timeline pauses for `loopDelay` ms before restarting from the beginning. This gives the viewer a moment to register the completed state before the cycle repeats.

### SVG `draw` property

`svg.createDrawable(selector)` wraps matched SVG stroke elements and exposes a synthetic `draw` property that maps to `stroke-dashoffset` and `stroke-dasharray` automatically. The value is a `"start end"` string where both `start` and `end` are fractions of the total path length (0 = path beginning, 1 = path end):

| `draw` value | Visual effect |
|---|---|
| `'0 0'` | Stroke fully hidden (zero-length visible segment) |
| `'0 1'` | Stroke fully drawn (visible from start to end) |
| `'0.25 0.75'` | Middle 50% of the stroke is visible |
| `'1 1'` | Stroke fully erased from the front (zero-length visible segment at end) |

**Draw → erase sequence.** A two-step timeline animates from hidden to drawn, then erases from the front:

```js
// Step 1: draw the stroke (end advances from 0 to 1, start stays at 0)
.add(svg.createDrawable('.ring'), { draw: ['0 0', '0 1'] })
// Step 2: erase from the front (start advances from 0 to 1, end stays at 1)
.add(svg.createDrawable('.ring'), { draw: ['0 1', '1 1'] })
```

After step 2 the state is `'1 1'` (zero-length visible segment at the end of the path), which visually matches the initial `'0 0'` state — so the loop restarts cleanly.

`svg.createDrawable` is called once per `.add()` call (not stored in a variable), so the same selector can be re-used across multiple steps.

### Demos in this repo

Three demonstrations live in `_posts/2026-01-01-testing.md` under `## Anime.js animations`:

| Demo | APIs used | What it shows |
|---|---|---|
| Staggered wave | `animate`, `stagger`, `loop: true`, `alternate: true` | 9 dots bounce in a rolling wave; `alternate` reverses the animation each loop so it doesn't snap back |
| SVG concentric circles | `createTimeline`, `svg.createDrawable`, `stagger` with `from: 'last'` | 4 rings draw themselves inward, then erase outward, on repeat |
| Grid ripple | `createTimeline`, `stagger` with `grid` and `from: 'center'` | 6×6 grid scales in from the centre then collapses back |

### Updating the bundle

Copy the new bundle from `anime/dist/bundles/anime.umd.min.js` to `assets/js/anime.min.js`. No config change is needed. The `anime/` folder itself must remain in the `exclude` list in `_config.yml`.

### Files

| File | Purpose |
|---|---|
| `assets/js/anime.min.js` | Anime.js v4.3.6 UMD bundle (static asset served to the browser) |
| `anime/dist/bundles/anime.umd.min.js` | Source bundle (excluded from Jekyll build) |
