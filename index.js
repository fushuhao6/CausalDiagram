var canvas, ctx, isDown, offsetX, offsetY, startX, startY;
var storedLines = [];
var mode = 'drag';
var texts = [];
var text_up_down_pad = 10;
var text_left_right_pad = 5;
var drawFromText = -1;
var selectedText = -1;
const KEYWORD_FONTSIZE = 9;


function init_text(){
    text_list = ["diarrhea", "window open", "novel snack", "frozen food", "coffee", "pizza"];   // change the diagram by changing the text_list here, or you can pass in a text_list to the function

    texts = [];
    for (let i = 0; i < text_list.length; i++) {
        texts.push({
            text: text_list[i],
        });
    }

    let total_height = text_list.length * (2 * text_up_down_pad + KEYWORD_FONTSIZE);
    let cur_y = 300 - Math.round(0.5 * total_height);
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        text.width = ctx.measureText(text.text).width;
        text.height = KEYWORD_FONTSIZE;

        text.x = 400 - Math.round(0.5 * text.width);
        text.y = cur_y;
        cur_y += 2 * text_up_down_pad + KEYWORD_FONTSIZE;
    }
}


function start() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // variables used to get mouse position on the canvas
    reset_offset();

    // calculate width of each text for hit-testing purposes
    ctx.font = KEYWORD_FONTSIZE.toString() + "px verdana";

    // START: draw all texts to the canvas
    reset();
    add_listener();

    $('#next').mouseup(function(event) {
        $('#next').unbind('mouseup');
        // next step here
    });
}

function set_mode(m){
    mode = m;
}

function add_listener(){
    canvas = document.getElementById("canvas");

    canvas.addEventListener( "mousedown", handleMouseDown, false);
    canvas.addEventListener( "mousemove", handleMouseMove, false);
    canvas.addEventListener( "mouseup", handleMouseUp, false);
    canvas.addEventListener( "mouseout", handleMouseOut, false);

    // Add active class to the current button (highlight it)
    var btns = document.getElementsByClassName("btn");
    for (var i = 0; i < btns.length - 2; i++) {
        btns[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            if (current.length > 0) {
                current[0].className = current[0].className.replace(" active", "");
            }
            this.className += " active";
        });
    }
}


function reset_offset(){
    let rect = canvas.getBoundingClientRect();
    offsetX = rect.left;
    offsetY = rect.top;
}


function reset(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    storedLines = [];
    init_text();
    draw();
    set_mode("drag");

    // change active button
    var current = document.getElementsByClassName("active");
    if (current.length > 0) {
        current[0].className = current[0].className.replace(" active", "");
    }
    var dragBtn = document.getElementById("dragText");
    dragBtn.className += " active";
}


function move_attached_lines(){
    var cleanedStoredLines = []
    for (var i = 0; i < storedLines.length; i++) {
        var hit1 = -1;
        var hit2 = -1;
        for (var j = 0; j < texts.length; j++) {
            if (textHittest(storedLines[i].x1, storedLines[i].y1, j)) {
                hit1 = j;
            }
            if (textHittest(storedLines[i].x2, storedLines[i].y2, j)) {
                hit2 = j;
            }
        }
        if(hit1 >= 0 && hit2 >= 0 && hit1 !== hit2) {
            cleanedStoredLines.push(storedLines[i])
        }
    }
    storedLines = cleanedStoredLines;
}


// clear the canvas draw all texts
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];

        // draw rectangle around text
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(text.x - text_left_right_pad, text.y - text.height - text_up_down_pad,
            text.width + 2 * text_left_right_pad, 2 * text_up_down_pad + text.height);

        ctx.fillText(text.text, text.x, text.y);
    }

    move_attached_lines();
    if (storedLines.length == 0) {
        return;
    }

    // redraw each stored line
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    for (var i = 0; i < storedLines.length; i++) {
        ctx.beginPath();
        // ctx.moveTo(storedLines[i].x1, storedLines[i].y1);
        // ctx.lineTo(storedLines[i].x2, storedLines[i].y2);
        canvas_arrow(ctx, storedLines[i].x1, storedLines[i].y1, storedLines[i].x2, storedLines[i].y2);
        ctx.stroke();
    }
}

// test if x,y is inside the bounding box of texts[textIndex]
function textHittest(x, y, textIndex) {
    var text = texts[textIndex];
    return (x >= text.x - text_left_right_pad && x <= text.x + text.width + text_left_right_pad
        && y >= text.y - text.height - text_up_down_pad && y <= text.y + text_up_down_pad);
}


function redo(){
    switch(mode) {
        case 'drag':
            break;
        case 'draw':
            storedLines.pop()
            draw();
            break;
        default:
        // code block
    }
}

// handle mousedown events
// iterate through texts[] and see if the user
// mousedown'ed on one of them
// If yes, set the selectedText to the index of that text
function handleMouseDown(e) {
    reset_offset();
    e.preventDefault();
    switch(mode) {
        case 'drag':
            startX = parseInt(e.clientX - offsetX);
            startY = parseInt(e.clientY - offsetY);

            for (var i = 0; i < texts.length; i++) {
                if (textHittest(startX, startY, i)) {
                    selectedText = i;
                }
            }

            break;
        case 'draw':
            var mouseX = parseInt(e.clientX - offsetX);
            var mouseY = parseInt(e.clientY - offsetY);
            drawFromText = -1;
            for (var i = 0; i < texts.length; i++) {
                if (textHittest(mouseX, mouseY, i)) {
                    drawFromText = i;
                }
            }

            if(drawFromText < 0){
                break;
            }

            e.stopPropagation();

            isDown = true;
            startX = mouseX;
            startY = mouseY;
            break;
        default:
        // code block
    }
}

// done dragging
function handleMouseUp(e) {
    e.preventDefault();
    switch(mode) {
        case 'drag':
            selectedText = -1;
            break;
        case 'draw':
            var mouseX = parseInt(e.clientX - offsetX);
            var mouseY = parseInt(e.clientY - offsetY);
            var drawToText = -1;
            for (var i = 0; i < texts.length; i++) {
                if (textHittest(mouseX, mouseY, i)) {
                    drawToText = i;
                }
            }

            e.stopPropagation();

            isDown = false;

            if(drawToText >= 0 && drawFromText >=0 && drawToText !== drawFromText){
                storedLines.push({
                    x1: startX,
                    y1: startY,
                    x2: mouseX,
                    y2: mouseY
                });
            }

            draw();
            break;
        default:
        // code block
    }
}

// also done dragging
function handleMouseOut(e) {
    e.preventDefault();
    switch(mode) {
        case 'drag':
            selectedText = -1;
            break;
        case 'draw':
            e.stopPropagation();

            if(!isDown){return;}

            isDown = false;

            draw();
            break;
        default:
        // code block
    }
}

// handle mousemove events
// calc how far the mouse has been dragged since
// the last mousemove event and move the selected text
// by that distance
function handleMouseMove(e) {
    e.preventDefault();
    switch(mode) {
        case 'drag':
            if (selectedText < 0) {
                return;
            }
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mousemove stuff here
            var dx = mouseX - startX;
            var dy = mouseY - startY;
            startX = mouseX;
            startY = mouseY;

            var text = texts[selectedText];
            text.x += dx;
            text.y += dy;
            draw();
            break;
        case 'draw':
            e.stopPropagation();

            if (!isDown) {
                return;
            }

            draw();

            var mouseX = parseInt(e.clientX - offsetX);
            var mouseY = parseInt(e.clientY - offsetY);

            // draw the current line
            ctx.beginPath();
            // ctx.moveTo(startX, startY);
            // ctx.lineTo(mouseX, mouseY);
            canvas_arrow(ctx, startX, startY, mouseX, mouseY);
            ctx.stroke()
            break;
        default:
        // code block
    }
}


function canvas_arrow(context, fromx, fromy, tox, toy) {
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

