$(function () {

    var board;
    var game;
    var socket = io();

    var handleMove = function (source, target) {
        var move = game.move({ from: source, to: target });

        if (move === null) return 'snapback';
    };

    socket.on('init', function () {
        var cfg = {
            draggable: true,
            position: 'start',
            onDrop: handleMove,
        };
        board = new ChessBoard('gameBoard', cfg);
        game = new Chess();
        socket.emit(game.turn());
    });

    socket.on('move', function (data) {
        var move = game.move({ from: data.from, to: data.to });
        var turn = game.turn();

        if (move === null) {
            return 'snapback';
        }
        else {
            board.move(data.from + '-' + data.to);
            socket.emit(turn);
        }

        // display turn
        document.getElementById("debugText").innerHTML = game.turn() === 'b'
            ? 'Black\'s turn'
            : 'White\'s turn';

        if (game.in_checkmate())
        {
            document.getElementById("debugText").innerHTML = game.turn() === 'b'
                ? 'White won'
                : 'Black won';
        }
    });
});