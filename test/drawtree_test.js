const assert = require('assert');
const dt = require('../drawtree.js')

describe('DrawTree', function() {

    it('Empty returns empty', function() {
        assert.equal(dt.drawTree(""), "");
    });

    it('nl returns nl', function() {
        assert.equal(dt.drawTree("\n"), "\n");
    });

    it('toy #1', function() {
        assert.equal(dt.drawTree("A\nB\nC"), "A\nB\nC\n");
    });

    it('toy #2', function() {
        assert.equal(dt.drawTree("A\n\tB\n\t\tC"), `A
  |
  +--B
       |
       +--C
`);
    });

    it('toy #3', function() {
        assert.equal(dt.drawTree("A\n  B\n    C"), `A
  |
  +--B
       |
       +--C
`);
    });

});