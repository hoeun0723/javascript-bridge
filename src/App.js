const { Console } = require("@woowacourse/mission-utils");
const BridgeGame = require("./BridgeGame");
const BridgeMaker = require("./BridgeMaker");
const InputView = require("./InputView");
const OutputView = require("./OutputView");
const Validation = require("./libs/Validation");
const { generate } = require("./BridgeRandomNumberGenerator");

class App {
  constructor() {
    this.bridgeGame = null;
  }
  play() {
    OutputView.printStartMessage();
    this.requestBridgeSize();
  }
  requestBridgeSize() {
    InputView.readBridgeSize((size) => {
      const { errorMsg } = Validation.validateBridgeSize(size);
      if (errorMsg)
        return throwException(errorMsg, () => this.requestBridgeSize());

      const bridge = BridgeMaker.makeBridge(Number(size), generate);
      this.bridgeGame = new BridgeGame(bridge);

      this.requestDirection();
    });
  }
  requestDirection() {
    InputView.readMoving((direction) => {
      try {
        Validation.validateDirection(direction);
      } catch {
        OutputView.printErrorMessage(error);

        return this.requestDirection();
      }
      this.bridgeGame.move(direction);
      OutputView.printMap(this.bridgeGame.getBridgeCrossingResult());

      if (this.bridgeGame.isFail()) return this.requestRestartOrQuit();

      if (this.bridgeGame.isLast()) return this.quit();

      return this.requestDirection();
    });
  }
  requestRestartOrQuit() {
    InputView.readGameCommand((commandOption) => {
      const { errorMsg } = Validation.checkCommandOption(commandOption);
      if (errorMsg)
        return throwException(errorMsg, () => this.requestRestartOrQuit());
      if (commandOption === "R") return this.restart();
      return this.quit();
    });
  }
  restart() {
    this.bridgeGame.retry();
    this.requestDirection();
  }
  quit() {
    OutputView.printEndMessage(this.bridgeGame.isFail());
    OutputView.printMap(this.bridgeGame.getBridgeCrossingResult());
    OutputView.printResult(this.bridgeGame.getResult());
    Console.close();
  }
}
const app = new App();
app.play();

module.exports = App;
