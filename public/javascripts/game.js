import { statics } from './configuration.js'
import { PrizeController } from './prize.js'

class Game {
    initFields(x, y) {
        // >> Clean game field and init a new one.
        // ---
        // >> ARGUMENTS :
        // x (Integer): width of playground 
        // y (Integer): height of playground
        // ---
        // >> RETURN : null
        let game = document.getElementById('game');
        let gameboard = document.createElement('table');
        for(let i = 0; i < y; i ++) {
            let line = document.createElement('tr');
            for(let j = 0; j < x; j ++) {
                let block = document.createElement('td');
                block.setAttribute('id', i + '_' + j);
                line.appendChild(block);
            } 
            gameboard.append(line);
        } 
        game.appendChild(gameboard);
    }
    initBorder() {
        // >> Optional parent method for adding border.
        // ---
        // >> ARGUMENTS :
        // ---
        // >> RETURN : null
        let game = document.getElementById('game');
        if (game.childElementCount) {
            game.children[0].className += 'table table-bordered';
        }
    }
}

class Gobang extends Game {
    constructor(x_length, y_length) {
        // >> Child object of Game, to have 5 adjacent dots in 4 quadrants to win the game.
        // ---
        // Arguments : 
        // x_length (Integer): width of this game.
        // y_length (Integer): height of this game.
        // ---
        // RETURN : null
        super();    //super parent constructor.
        this.initFields(x_length, y_length);
        this.initBorder();
        this.callbackEvent();   // load onclick event
        this.player = 'client'; // start with client.
        this.player_move = {
            'client' : 1,
            'server' : -1
        }
        this.states = function(){   //manipulate 2D array with position as ID on server side.
            let space = Array();
            for (let y = 0; y < y_length; y ++) {
                space.push(Array(x_length).fill(0));
            }
            return space;
        }();
    };
    callbackEvent() {
        // >> Add click event to each td.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        let self = this;
        $('td').each(function(){
            $(this).on('click', function(){
                self.makeMove(this.id)
            })
        }
        )
    };
    makeMove(position) {
        // >> Refresh the view and pass the clicked position to `check`.
        // ---
        // Arguments : 
        // position (String): ID of the clicked td. #3_5, #10_2 ...
        // ---
        // RETURN : null
        this.appendDot(position);       // mark the td with color.
        $('#'+position).off('click');   // remove the binding click event.
        this.updateState(position);     // update the 2D array.
        let result = this.check(position)
        if (!result) {
            this.player = (this.player == 'client') ? 'server' : 'client'; //switch turn.
            if (this.player == 'server') {
                this.makeMove(ServerMove(this).join('_'));
            }
        }
    };
    check(position) {
        // >> Check if current move meet the winning condition
        // ---
        // Arguments : 
        // position (String): ID of the clicked td. #3_5, #10_2 ...
        // ---
        // RETURN : bool (true will stop the calling stack and jump into `toResult` for next game.)
        let x = parseInt(position.split('_')[0]);
        let y = parseInt(position.split('_')[1]);
        let curLongest = this.findLongestAdjacent([x, y])
        console.log(this.player, curLongest)
        if (curLongest == 4 && this.player == 'client') {
            this.appendDot(position);  
            toResult('Win', statics.game.Gobang.point_win)
            return true;
        }
        else if (curLongest == -4 && this.player == 'server') {
            this.appendDot(position);  
            toResult(null, statics.game.Gobang.point_lose)
            return true
        }
        else {
            return false;
        }
        
    }
    updateState(position) {
        // >> Update 2D Array.
        // ---
        // Arguments : 
        // position (String): ID of the clicked td. #3_5, #10_2 ...
        // ---
        // RETURN : null
        let x = parseInt(position.split('_')[0]);
        let y = parseInt(position.split('_')[1]);
        this.states[y][x] = this.player_move[this.player];
    };
    appendDot(position) {
        // >> Update view.
        // ---
        // Arguments : 
        // position (String): ID of the clicked td. #3_5, #10_2 ...
        // ---
        // RETURN : null
        let td = document.getElementById(position);
        td.className = (this.player == 'client') ? 'dot-client' : 'dot-server';
    };
    findLongestAdjacent(position) {
        // >> find the longest length of adjacent dots in every bi-verticals
        // ---
        // Arguments : 
        // position (String): ID of the clicked td. #3_5, #10_2 ...
        // ---
        // RETURN : Integer, 3, 1, -2 ... 
        let self = this;
        let Quadrants = [[[1, 0], [-1, 0]], [[0, 1], [0, -1]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]]];
        var curSum = 0;
        let recur_connected = function(p, dir) {    // recursive function to count same value in the direction.
            let np = [p[0] + dir[0], p[1] + dir[1]];
            try {
                if (self.states[p[1]][p[0]] == self.states[np[1]][np[0]] && self.states[p[1]][p[0]] != null) {
                
                    return self.states[np[1]][np[0]] + recur_connected(np, dir);
                }
                else {
                    return 0;
                }
            }
            catch(error) {
                return  0;
            }
        }
        Quadrants.forEach(elements => {
            let Quadrant = 0 
            elements.forEach(element => {
                let next_p = [position[0] + element[0], position[1] + element[1]]; 
                try {
                    if (self.states[next_p[1]][next_p[0]] != 0 && self.states[next_p[1]][next_p[0]] != null) {
                        let result = self.states[next_p[1]][next_p[0]] + recur_connected(next_p, element);
                        Quadrant = (Quadrant * result < 0) ? Math.max(Quadrant, result):Quadrant + result;
                    }
                }
                catch(error) {
                    curSum += 0
                }
            });
            if (Math.abs(Quadrant) > Math.abs(curSum)) {    // find the longest in both server and client moves.
                curSum = Quadrant;
            }
        })
        return curSum;
    }
}

function ServerMove(gobang) {
    // >> find the longest length of adjacent dots recursively, to block or extend.
    // ---
    // Arguments : 
    // gobang : Gobang object
    // ---
    // RETURN : Array, [1, 3], [5, 7] ...
    var maxSoFar = 0;
    var max_at = [0, 0];
    for (let y = 0; y < gobang.states.length; y ++ ){
        for (let x = 0; x < gobang.states[0].length; x ++ ) {
            if (gobang.states[y][x] == 0) {
                let curSum = Math.abs(gobang.findLongestAdjacent([x, y]));
                if (curSum > maxSoFar) {
                    maxSoFar = curSum;
                    max_at = [x, y];
                }
            }
        }
    }
    return max_at
}

class Snake extends Game {
    constructor(x_length, y_length) {
        // >> Child object of Game, make yourself as long as possible by eating food.
        // ---
        // Arguments : 
        // x_length (Integer): width of this game.
        // y_length (Integer): height of this game.
        // ---
        // RETURN : null
        super(); 
        this.x_length = x_length;
        this.y_length = y_length;
        this.initFields(x_length, y_length);
        this.initBorder()  
        this.speed = statics.game.Snake.init_speed;               // Snake move speed.
        this.snake_length = statics.game.Snake.init_length;          // initial length.
        this.snake_body = Array();      // Queue for each piece position.
        this.food = this.createFood(); 
        this.initSnake();
        this.direction = [0, 1];
        this.speedUp();
        this.callbackEvent()
    }
    getRandomIntInclusive(min, max) {
        // >> Random number method.
        // ---
        // Arguments : 
        // min (Integer): bottom of random.
        // max (Integer): cap of random.
        // ---
        // RETURN : Integer
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    initSnake() {
        // >> Initialize the snake with length on random position.
        // ---
        // Arguments :
        // ---
        // RETURN : null
        let x = this.getRandomIntInclusive(this.snake_body, this.x_length-1);
        let y = this.getRandomIntInclusive(this.snake_body, this.y_length-1);
        for (let i = 0; i < this.snake_length ; i ++ ) {
            let p = [y, x-i];
            this.snake_body.push(p);
        }
        this.fillColor(this.snake_body);
    }
    callbackEvent() {
        // >> Add keyboard event to change head direction.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        $(document).keydown((e) => {
            let switch_to = null
            switch (e.keyCode) {
                case 37:
                    switch_to = [0, -1];
                    break
                case 39 : 
                    switch_to = [0, 1];
                    break
                case 38 :
                    switch_to = [-1, 0];
                    break
                case 40 :
                    switch_to = [1, 0];
                    break
                default:
                    break;
            }
            if (switch_to) {
                let current = [this.snake_body[0][0] - this.snake_body[1][0], this.snake_body[0][1] - this.snake_body[1][1]]
                let c = switch_to.map((x)=> Math.abs(x));
                if (c[0] != Math.abs(current[0]) || c[1]!= Math.abs(current[1])){
                    this.direction = switch_to;
                }
            }
        }
        )
    }
    fillColor() {
        // >> Update view with latest .snake_body and food.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        $('td').css({backgroundColor: 'white'});
        this.snake_body.forEach(element => {
            $('#'+element.join('_')).css({backgroundColor: 'black'});
        });
        $('#'+this.food.join('_')).css({backgroundColor: 'red'});
    }
    crossBorder(next) {
        // >> Convert the position when head reaching border.
        // ---
        // Arguments : 
        // next (Integer): head position.
        // ---
        // RETURN : null
        if (next[0] < 0 || next[0] == this.x_length) {
            next[0] = (next[0] + this.x_length)%this.x_length;
        }
        else if (next[1] < 0 || next[1] == this.y_length) {
            next[1] = (next[1] + this.y_length)%this.y_length;
        }
        return next;
    }
    moveForward() {
        // >> unshift next td in direction and pop the last in body, also determine below condition.
        // >> * hit body : will call getResult() to stop the game and calculate points with length.
        // >> * eat food : recover the drop to extend length and reset interval to speed up.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        let next = [this.snake_body[0][0]+this.direction[0], this.snake_body[0][1]+this.direction[1]];
        next = this.crossBorder(next);
        this.snake_body.unshift(next);
        let drop = this.snake_body.pop();
        let checker = this.snake_body.map((x)=>x.join('_'))
        
        if (new Set(checker).size != checker.length) {

            clearInterval(this.interval);
            toResult('Win', this.snake_length * statics.game.Snake.point_weight);
            
        }
        else if (next.join('_') == this.food.join('_')) {
            this.snake_length += 1;
            this.speed -= statics.game.Snake.accelerate;
            this.speedUp()
            this.snake_body.push(drop);
            this.food = this.createFood();
        }
        this.fillColor();
    }
    speedUp() {
        // >> Reset interval with updated speed.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.moveForward()
        }, this.speed);
    }
    createFood() {
        // >> Create food in fields randomly.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        let food = [this.getRandomIntInclusive(0, this.x_length-1), this.getRandomIntInclusive(0, this.y_length-1)];
        while (this.snake_body.map((x)=> x.join('_')).includes(food.join('_'))) {
            food = [this.getRandomIntInclusive(0, this.x_length-1), this.getRandomIntInclusive(0, this.y_length-1)];
        }
        return food;
    }
}

class Scratch extends Game {
    constructor() {
        // >> Child object of Game, scratch for the prize.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        super();
        this.prize = Prize.shufflePrize()       // get prize randomly.
        this.initScratch(this.prize);
        Prize.ajaxUpdate('prize', this.prize);  // update database with the scratched prize.
    }
    initScratch(p) {
        // >> Render the game field.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        $('#game').append(
            $('<div>', {'class': 'scratch-container'}).append(
                $('<div>', {'class': 'scratchpad', 'id': 'promo'})
            )
        ).append(
            $('<div>', {'class': 'promo-container', 'style': 'display: none'}).append(
                $('<button>', {'class': 'promo-code nes-btn'}).on('click', ()=>{
                    Games.initGame('Win');
                })
            )
        )
        $('#promo').wScratchPad(
            {
                size: 70,
                bg: '../images/prize/'+ p + '.jpeg',
                realtime : true,
                fg: '../images/overlay.png',
                scratchMove: (e, percent) => {
                    if(percent > 50) {
                        $('.promo-container').show();
                        $('.promo-code').html("YOU'VE WON "+ p + " 賞!");
                    }
                }
            }
        )
    }
}


class GameController {
    constructor() {
        // >> Object to control the interaction with client.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        this.games = {"Snake" : Snake, "Gobang" : Gobang, "Scratch" : Scratch};
        this.current_game = undefined;
        this.payScratch();

    }
    initGame(GameResult) {
        // >> Render the game field.
        // ---
        // Arguments : 
        // GameResult (bool) : to determine whether to move into next
        // ---
        // RETURN : null
        if (GameResult) {
            let gameArr = Object.keys(this.games);
            let curIndex = gameArr.indexOf(this.current_game)
            this.current_game = (curIndex == gameArr.length - 1)? gameArr[0]: gameArr[curIndex+1];
        }
        this.initMask(GameResult);
    }
    payScratch() {
        // >> Child object of Game, make yourself as long as possible by eating food.
        // ---
        // Arguments : 
        // ---
        // RETURN : null
        $('#luckydraw').on('click', ()=> {
            if (Prize.point >= statics.scratchPoint) {
                Prize.ajaxUpdate('point', Prize.point - statics.scratchPoint);
                this.current_game = 'Gobang';
                this.initGame('Win');
            }
            else {
                alert('YOU NEED ___ POINT FOR A SCRATCH!'.replace('___', statics.scratchPoint - Prize.point))
            }
        })
    }
    initMask(GameResult) {
        // >> Render the game field with mask.
        // ---
        // Arguments : 
        // GameResult (bool) : show different context respectively.
        // ---
        // RETURN : null
        $('#game').empty();
        $('#game').append(
            $('<div>', {'class' : 'h-100 nes-container with-title is-centered'}).append(
                $('<p>', {'class' : 'title'}).text((GameResult == 'Win')?'START PLAYING '+this.current_game + '!!':'YOU LOSE!!')
            ).append(
                $('<div>', {'class' : 'row-justify-content-center'}).append(
                    $('<img>', { 'style' : 'height: 40   %; width: 40%;',
                        'src': '../images/___.jpg'.replace('___', (GameResult == 'Win')?'play':'lose')
                    })
                )
            ).append(
                $('<div>', {'class' : 'w-100 m-3'})
            ).append(
                $('<div>', {'class' : 'row justify-content-center'}).append(
                    $('<div>', {'class' : 'col-6'}).append(
                        $('<button>', {'class' : 'nes-btn'}).text((GameResult == 'Win')?'<NEW GAME>':'<TRY AGAIN>').on(
                            'click', () => {
                                $('#game').empty();
                                var current_game = this.games[this.current_game],
                                    width = statics.game[this.current_game].field_width,
                                    height = statics.game[this.current_game].field_height;
                                
                                var game = new current_game(width, height);
                            }
                        )
                    )
                )
            )
        )
    }
}
var Games = new GameController();
var Prize = new PrizeController();

Games.initGame('Win'); 

function toResult(GameResult, point) {
    // >> Update point and call GameController Object for next step.
    // ---
    // Arguments : 
    // GameResult (String) : either `Win` or `Lose`.
    // point (Integer) : point to be added. 
    // ---
    // RETURN : null    

    $('gameResult').text(GameResult + '!!').fadeIn('fast')
    $('gameResult').fadeOut('slow');
    Prize.ajaxUpdate('point', point); // update point
    Games.initGame(GameResult);  // reset game field
}