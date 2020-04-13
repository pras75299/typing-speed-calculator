import React, { Component } from "react";
import "./App.css";
import Preview from "./Preview";
import Speed from "./Speed";
import GetText from "./GetText";

const initialState = {
  text: GetText(),
  userInput: "",
  symbols: 0,
  sec: 0,
  started: false,
  finished: false,
};
class App extends Component {
  state = initialState;
  onRestart = () => {
    this.setState(initialState);
  };
  onInputChange = (event) => {
    const val = event.target.value;
    this.setTimer();
    this.onFinish(val);
    this.setState({
      userInput: val,
      symbols: this.countSymbols(val),
    });
  };

  onFinish(userInput) {
    if (userInput === this.state.text) {
      clearInterval(this.interval);
      this.setState({ finished: true });
    }
  }

  countSymbols = (userInput) => {
    const text = this.state.text.replace(" ", "");
    return userInput
      .replace(" ", "")
      .split("")
      .filter((s, i) => s === text[i]).length;
  };

  setTimer = () => {
    if (!this.state.started) {
      this.setState({ started: true });
      this.interval = setInterval(() => {
        this.setState((prevProps) => {
          return { sec: prevProps.sec + 1 };
        });
      }, 1000);
    }
  };

  render() {
    return (
      <div className="container mb-5 mt-5">
        <h3 className="text-center mb-4 text-success">
          Typing speed Calculator
        </h3>
        <div className="row">
          <div className="col-md-6 col-12 mx-auto">
            <Preview text={this.state.text} userInput={this.state.userInput} />
            <textarea
              value={this.state.userInput}
              onChange={this.onInputChange}
              className="form-control mb-3"
              placeholder="Start typing.."
              readOnly={this.state.finished}
            ></textarea>
            <Speed symbols={this.state.symbols} sec={this.state.sec} />
            <div className="text-right mx-auto">
              <button
                className="btn btn-outline-primary"
                onClick={this.onRestart}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
