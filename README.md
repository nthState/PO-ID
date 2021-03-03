# PO-ID

What if you could have your own design for a Pocket Operators screen?

## What is it?

The Pocket Operators by Teenage Engineering are great devices, they have custom screens
with animations, I'd like to be able to draw my own custom screen and in the future run
it on a Pocket Operator.

This code is just a proof of concept for allowing a user to design their own.

# Todo

- [ ] On-load a custom sequence should be playing
- [ ] Draw mode, one item selected at a time
- [ ] Draw mode, draw on canvas
- [ ] Use mode, hitting a button would display the pads drawing
- [ ] Write mode, Single pattern only, set bpm
- [ ] Write mode, set the pattern, 16 slots, on/off
- [ ] Play mode, each hit would show the corresponding pads image
- [ ] Erase button, removes from the drawing
- [ ] Export the *.PSD to slices for HTML

## Getting Started

- [ ] Download/Clone this project
- [ ] Run `zsh compileAndWatch.zsh` (macOS) (You may need to install the TypeScript compiler)
- [ ] Open `index.html` and have fun!

## Future Todo

- [ ] It looks like a Pocket Operator has 3 or 4 frames of animation per pad, we should extend the code to support this.
- [ ] The demo only has one pattern to play, it could be extended to play more

## Notes

I'm not a TypeScript developer, This is just something I've had
in my mind for a while now, and I just wanted to make it.
Using a Browser feels like the most accessible way.
