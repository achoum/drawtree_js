// How to display the tree.
class DisplayStyle {

    constructor(connector, final_connector, vertical, horizontal) {
        this.connector = connector;
        this.final_connector = final_connector;
        this.vertical = vertical;
        this.horizontal = horizontal;
    }
}

// Basic display style. Used by default.
const BASIC_STYLE = new DisplayStyle( /*connector =*/ "+", /*final_connector =*/ "+", /*vertical =*/ "|", /*horizontal =*/ "--");

// Generates a pretty string representation of a tree defined with tabulated items.
function drawTree(raw, style = BASIC_STYLE) {
    const items = lexe(raw);
    let reader = new ItemReader(items);
    const root = parse(reader);
    return displayTree(root, style);
}

class LexItem {
    constructor(depth, content) {
        this.depth = depth;
        this.content = content;
    }
}

// Lexes the raw text.
function lexe(raw) {
    let items = [];
    let line_idx = -1;
    for (const raw_line of raw.split("\n")) {
        line_idx += 1;
        if (line_idx == 0 && raw_line.length == 0) { continue; }
        const [depth, line] = numTabs(raw_line);
        items.push(new LexItem(depth, line));
    }
    return items;
}

// Stream-style accessor for the lex items.
class ItemReader {
    constructor(items) {
        this.items = items;
        this.next_item_idx = 0;
    }

    hasNext() {
        return this.next_item_idx < this.items.length;
    }

    curItem() {
        return this.items[this.next_item_idx];
    }

    consumeCur() { this.next_item_idx++; }
}

// A tree.
class Tree {
    constructor(depth) {
        this.depth = depth;
        this.value = null;
        this.children = [];
    }
}

// Extracts a tree from a lexer result.
function parse(reader, depth = -1) {
    let root = new Tree(depth);

    if (!reader.hasNext() || depth > 5) { return root; }

    // Node content.
    if (reader.curItem().depth == depth) {
        root.value = reader.curItem().content;
        reader.consumeCur();
    }

    // Children.
    while (reader.hasNext() && reader.curItem().depth > depth) {
        root.children.push(parse(reader, depth + 1));
    }

    return root;
}

// Converts a tree structure into a user readable representation.
function displayTree(root, style, is_last_child, prefix = "") {

    // The node value.
    let formatted = "";
    if (root.value !== null) {
        formatted += prefix;
        if (root.depth > 0) {
            formatted += "  " + (is_last_child ? style.final_connector : style.connector) + style.horizontal;
        }
        formatted += root.value + "\n";
    }

    if (root.children.length == 0) { return formatted; }

    // Prefix in front of the children.
    let sub_prefix;
    if (root.depth <= 0) {
        sub_prefix = "";
    } else
    if (!is_last_child) {
        sub_prefix = prefix + "  " + style.vertical + "  ";
    } else {
        sub_prefix = prefix + "     ";
    }

    // Connection to children.
    if (root.depth >= 0) {
        formatted += sub_prefix + "  " + style.vertical + "\n";
    }

    // The children.
    for (const child_idx in root.children) {
        const sub_is_last_child = child_idx == root.children.length - 1;
        formatted += displayTree(root.children[child_idx], style, sub_is_last_child, sub_prefix);
    }
    return formatted;
}

// Number of tabulations, or groups of 2-spaces at the start of the string.
function numTabs(value) {
    if (value.length == 0) { return [0, value]; }

    let count;
    if (value.charAt(0) == '\t') {
        count = 0;
        while (value.charAt(count) === '\t') {
            count++;
        }
        return [count, value.substring(count)];
    } else if (value.charAt(0) == ' ') {
        count = 0;
        while (value.charAt(count) === ' ') {
            count++;
        }
        return [Math.floor(count / 2), value.substring(count)];
    } else { return [0, value]; }
}

module.exports = { drawTree };