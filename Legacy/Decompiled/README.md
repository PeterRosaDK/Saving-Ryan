# Decompiled Director data

`DirectorDump.txt` is a text snapshot of the four legacy Director movies. It
contains movie metadata, cast-library references, frame labels, cast-member
metadata, embedded text, and decompiled Lingo handlers.

Regenerate it from the project root with the utility documented in
`tools/director/README.md`:

```sh
saving_ryan_director_dump \
  Legacy/Intro.dir \
  Legacy/Spillet.dir \
  Legacy/Video.dir \
  Legacy/Billeder.dir \
  > Legacy/Decompiled/DirectorDump.txt
```

The dump is migration evidence, not executable web-app source. The original
`.dir` files remain authoritative whenever the decompiler output is ambiguous.
