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

const BOX_LIGHT_DRAWING_STYLE = new DisplayStyle( /*connector =*/ "├", /*final_connector =*/ "└", /*vertical =*/ "│", /*horizontal =*/ "─");

const BOX_DOUBLE_DRAWING_STYLE = new DisplayStyle( /*connector =*/ "╠", /*final_connector =*/ "╚", /*vertical =*/ "║", /*horizontal =*/ "═ ");

const STYLES = {
    "Basic": BASIC_STYLE,
    "Light box": BOX_LIGHT_DRAWING_STYLE,
    "Double box": BOX_DOUBLE_DRAWING_STYLE,
};

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

    if (!reader.hasNext()) { return root; }

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
function displayTree(root, style, is_last_child, prefix = "", shift = 2) {
    const shift_space = " ".repeat(shift);

    // The node value.
    let formatted = "";
    let child_shift = 0;
    if (root.value !== null) {
        if (root.value.length <= 1) {
            child_shift = 0;
        } else if (root.value.length <= 2) {
            child_shift = 1;
        } else {
            child_shift = 2;
        }
        formatted += prefix;
        if (root.depth > 0) {
            formatted += shift_space + (is_last_child ? style.final_connector : style.connector) + style.horizontal;
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
        sub_prefix = prefix + shift_space + style.vertical + "  ";
    } else {
        sub_prefix = prefix + shift_space + "   ";
    }

    // Connection to children.
    if (root.depth >= 0) {
        formatted += sub_prefix + " ".repeat(child_shift) + style.vertical + "\n";
    }

    // The children.
    for (const child_idx in root.children) {
        const sub_is_last_child = child_idx == root.children.length - 1;
        formatted += displayTree(root.children[child_idx], style, sub_is_last_child, sub_prefix, child_shift);
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

module.exports = { drawTree, STYLES };