class Player {
    constructor(balance,name) {
      this._balance = balance;
      this._name = name;
      this._current_bet = 0;
      this._current_betAmount = 0;
      this._enabled = false;
    }
    get balance() {
      return this._balance;
    }
    get name() {
        return this._name;
      }
    get current_bet(){
        return this._current_bet;
    }
    get current_betAmount(){
      return this._current_betAmount;
    }
    get enabled(){
        return this._enabled;
    }
    set balance(x) {
      this._balance = x;
    }
    set name(x) {
        this._name = x;
      }
    set current_bet(x) {
        this._current_bet = x;
    }
    set current_betAmount(x) {
      this._current_betAmount = x;
    }
    set enabled(x) {
        this._enabled = x;
    }
  }

class Table {
    constructor(minbet,maxbet) {
        this._minbet = minbet;
        this._maxbet = maxbet;
        this._current_num = 0;
        this._previousnumbers = [];
      }
      get current_num() {
        return this._current_num;
      }
      get previousnumbers() {
          return this._previousnumbers;
        }
      set current_num(x) {
        this._current_num = x;
        this._previousnumbers.push(x);
      }         
}

module.exports = {Table,Player};