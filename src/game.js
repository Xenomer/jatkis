import React from 'react';
var socket = undefined;

function Square(props) {
  // create array for style classes so
  // they can be added when needed
  var styles = [
    'square'
  ];
  if(props.last) styles.push('squarelast');
  if(props.corner) styles.push(props.corner);
  return (
    <button className={styles.join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    // generate the grid
    var squares = new Array(parseInt(props.height, 10));
    for(var i=0;i<squares.length;i++){
      squares[i] = Array(parseInt(props.width, 10)).fill(null);
    }

    // set defaults
    this.state = {
      last: {x: undefined, y: undefined},
      props: props,
      squares: squares,
      xIsNext: true,
      won: false,
    };

    socket.on('move', (p) => {
      this.handleClick(p, true);
    });
    socket.on('leave', () => {
      if(this.state.won) return;
      alert('Opponent has left!');
      window.location.reload(); //reload page if opponent leaves
    });

    // bind 'this'
    this.calcWin = this.calcWin.bind(this);
  }

  // calculates if victory has been achieved
  calcWin(coord) {
    // copy the coordinates
    const coordmap = this.state.squares.slice();
    if(!coordmap[coord.y][coord.x]) return;
    var point = coordmap[coord.y][coord.x];

    var testPoint = function (c) {
      if(c.x < 0 || c.y < 0              // test if (x or y) < 0..
        || c.x > coordmap[0].length - 1  // ..or (x or y) > boundaries
        || c.y > coordmap.length - 1)
          return false;
      return coordmap[c.y][c.x] === point;
    };

    //relative positions for testing for straights
    const testables = [
      [1,0],
      [1,1],
      [0,1],
      [-1,1],
      [-1,0],
      [-1,-1],
      [1,-1],
      [0,-1],
    ];

    // moves specified coordinate by 1 to
    // direction spefified by testables index
    var moveCoord = function (c, index) {
      const item = testables[index];
      return {x: c.x+item[0], y: c.y+item[1]};
    }

    // test for each direction
    for(var i=0;i<8;i++){
      var c = coord;
      // test for straight of 5
      for(var count=0; count<5; count++){
        c = moveCoord(c, i);
        if(!testPoint(c)) { break; }
        // count needs to be tested for straightlength - 2
        else if (count === 3) {
          return point;
        }
      }
    }
  }

  // handles remote and local moves
  handleClick(coords, remote) {
    if(this.state.won) return;

    // return if you just clicked and it is opponents turn
    if(this.state.xIsNext !== (this.state.props.me === 'X') && !remote) return;
    //copy coordinate map
    const squares = this.state.squares.slice();
    //return if coord is used
    if(squares[coords.y][coords.x] !== null) return;

    squares[coords.y][coords.x] = this.state.xIsNext ? 'X' : 'O';

    // check for victory
    var won = this.calcWin({x:coords.x,y:coords.y});

    this.setState({
      props: this.state.props,
      squares: squares,
      xIsNext: !this.state.xIsNext,
      last: {x: coords.x, y: coords.y},
      won: won,
    });

    if(!remote){
      socket.emit('move', coords);
    }
  }
  renderSquare(props) {
    var value = this.state.squares[props.y][props.x];
    return <Square
      x={props.x}
      y={props.y}
      corner={props.corner}
      value={value}
      last={(props.x === this.state.last.x &&
        props.y === this.state.last.y)}
      onClick={() => this.handleClick(props)} />;
  }
  renderCells(width, y, height){
    var cells = [];
    for(var i = 0; i<width;i++){
      var style = null;
      if(y === 0 && i === 0) style = "square-lu";
      else if (y === 0 && i === width - 1) style = "square-ru";
      else if (y === height - 1 && i === width - 1) style = "square-rl";
      else if (y === height - 1 && i === 0) style = "square-ll";
      cells.push(this.renderSquare({x: i, y: y, corner: style}));
    }
    return cells;
  }
  renderRows(height, width){
    var rows = [];
    for(var i = 0; i<height;i++){
      rows.push(<div className="board-row">{this.renderCells(width, i, height)}</div>)
    }
    return rows;
  }
  setSize(e){
    var el = document.getElementById('board-grid');
    document.getElementById('sizelabel').innerHTML = `Size: ${e.target.value}%`
    var zoom = e.target.value / 100;
    el.style.transform = `scale(${zoom})`;
  }
  componentDidMount(){
    // default size slider to 100%
    document.getElementById('size').value = 100;
  }
  render() {
    var next;
    if(this.state.won){
      if(this.props.me === this.state.won) {
        next = `${this.props.myname} (${this.props.me}) won!`;
      }
      else{
        next = `${this.props.oname} (${this.state.won}) won!`;
      }
    }
    else{
      if((this.props.me === 'X' && this.state.xIsNext) ||
        (this.props.me !== 'X' && !this.state.xIsNext)) {
        next = `${this.props.myname}'s (${this.props.me}) turn`;
      }
      else{
        next = `${this.props.oname}'s (${this.props.me === 'X' ? 'O' : 'X'}) turn`;
      }
    }
    return (
      <div>
        <div className="status">
          <p id="sizelabel">Size: 100%</p>
          <input type="range" id="size" className="slider" onChange={this.setSize} min="50" /><br />
          <p>Name: {this.props.myname}</p>
          <p>{next}</p>
        </div>
        <div className="board">
          <div id="board-grid">
            {this.renderRows(this.state.props.height, this.state.props.width )}
          </div>
        </div>
      </div>
    );
  }
}

export default class Game extends React.Component {
  constructor(props){
    super();
    this.state = {
      id: props.id,
      width: props.width,
      height: props.height
    }
    socket = props.socket;
  }
  render() {
    return (
      <div className="game">
        <Board
          width={this.props.width}
          height={this.props.height}
          me={this.props.me}
          myname={this.props.myname}
          oname={this.props.oname} />
      </div>
    );
  }
}
