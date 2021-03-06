import React from 'react';
import ReactDOM from 'react-dom';
import openSocket from 'socket.io-client';

// import styles and components
import './index.css';
import Game from './game';

var config = require('./config.json');

// create and connect the socket we use for communicating
const socket = openSocket(config.API);


// this is the whole index page of the app
class LoginForm extends React.Component {
  constructor() {
    super();

    // set default values
    this.state = {
      name: '',
      id: '',
      x: 15,
      y: 15
    };

    //bind so these can use 'this.something'
    this.join = this.join.bind(this);
    this.create = this.create.bind(this);
  }

  join(e){
    e.preventDefault();
    if(this.state.id.length !== 5){
      alert('Invalid id!');
      return;
    }
    else if(!this.testName()) {
      alert("Invalid name!");
      return;
    }
    socket.emit('join', {id: this.state.id, name: this.state.name}, (props) => {
      // continue if server responds that the id is available
      if(props){
        ReactDOM.render(
          <Game
            width={props.width}
            height={props.height}
            socket={socket}
            me='O'
            myname={this.state.name}
            oname={props.name}/>,
          document.getElementById('root')
        );
      }
      else{
        alert('Invalid id!');
      }
    })
  }
  create(e){
    e.preventDefault();
    if(this.state.x < 5 || this.state.x > 100){
      alert('Invalid width!');
    }
    else if(this.state.y < 5 || this.state.y > 100){
      alert('Invalid height!');
    }
    else if(!this.testName()) {
      alert("Invalid name!");
      return;
    }
    else{
      var props = {width: this.state.x, height: this.state.y, name: this.state.name};
      socket.emit('create', props, (id) => {
        ReactDOM.render(
          <CreatedPage id={id} p={props} />,
          document.getElementById('root')
        );
      });
    }
  }
  testName(){
    if(!this.state.name ||
      this.state.name.length < 2) {
      return false;
    }
    else return true;
  }
  render() {
    return (
      <div id="index">
        {/* the 'hide-mobile' hides elements when on mobile layout (to save space) */}
        <h1>Jätkis<div className="hide-mobile"> - Jätkänshakki</div></h1>
        <input className="nameinput" type="text" placeholder="name" onChange={(e) => this.state.name = e.target.value} /> <br />
        <div className="box">
          {/* 'join game' box */}
          <form className="box-item-left" onSubmit={this.join}>
            Join a game<br />
            <input type="text" placeholder="game id" onChange={(e) => this.state.id = e.target.value}/> <br />
            <button type="button" onClick={this.join}>Join game</button>
          </form>

          {/* 'create game' box */}
          <form className="box-item-right" onSubmit={this.create}>
            Create a game<br />
            <input type="number"
              className="shortbox"
              placeholder="width"
              min="5" max="100"
              onChange={(e) => this.state.x = e.target.value}
              />
            x
            <input type="number"
              className="shortbox"
              placeholder="height"
              min="5" max="100"
              onChange={(e) => this.state.y = e.target.value} /> <br />
            <button type="button" onClick={this.create}>Create game</button>
          </form>
        </div>
      </div>
    );
  }
}

//used when user clicked 'Create game'
class CreatedPage extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: props.p.name,
      id: props.id
    };
    socket.on('join', (info) => {
      // render the game when another user joins
      ReactDOM.render(
        <Game
          width={this.props.p.width}
          height={this.props.p.height}
          socket={socket}
          me="X"
          myname={props.p.name}
          oname={info.name} />,
        document.getElementById('root')
      );
    });
  }
  render() {
    return (
      <div id="createdpage">
        <p>Game created. Your id:</p><br />
        <p>Name: {this.props.p.name}</p>
        <h2>{this.state.id}</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <LoginForm />,
  document.getElementById('root')
);
