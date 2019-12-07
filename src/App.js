import React, { Component } from 'react';

import { BrowserRouter, Route, Link } from 'react-router-dom';

import logo from './a.png';

import clohtes from './clothes.jpg';

import books from './books.jpg';

import donate from './donate.jpg'

import './App.css';

// Import the web3 library

import Web3 from 'web3';



// Material UI

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import DropDownMenu from 'material-ui/DropDownMenu';

import RaisedButton from 'material-ui/RaisedButton';

import TextField from 'material-ui/TextField';

import MenuItem from 'material-ui/MenuItem';



// Import build Artifacts

import tokenArtifacts from './build/contracts/Token.json';



class App extends Component {

  constructor(props) {

    super(props)

    this.state = {

      amount: 0,

      availableAccounts: [],

      defaultAccount: 0,

      ethBalance: 0,

      rate: 1,

      tokenBalance: 0,

      tokenSymbol: 0,

      transferAmount: '',

      transferUser: '',

      token: null, // token contract

    };

  }



  async componentDidMount() {

    // Create a web3 connection

    this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));



    this.web3.version.getNetwork(async (err, netId) => {

      const tokenAddress = tokenArtifacts.networks[netId].address;

      const token = this.web3.eth.contract(tokenArtifacts.abi).at(tokenAddress);

      this.setState({ token });

      console.log(token);



      // Set token symbol below

      const tokenSymbol = await token.symbol();

      this.setState({ tokenSymbol });



      // Set wei / token rate below

      const rate = await token.rate();

      this.setState({ rate: rate.toNumber() });



      this.loadAccountBalances(this.web3.eth.accounts[0]);

      this.loadEventListeners();



      this.web3.eth.getAccounts((err, accounts) => {

        // Append all available accounts

        for (let i = 0; i < accounts.length; i++) {

          this.setState({

            availableAccounts: this.state.availableAccounts.concat(

              <MenuItem value={i} key={accounts[i]} primaryText={accounts[i]} />

            )

          });

        }

      });

    });

  }



  // Load the accounts token and ether balances.

  async loadAccountBalances(account) {

    const balance = await this.state.token.balanceOf(account);

    this.setState({ tokenBalance: balance.toNumber() });



    const ethBalance = await this.web3.eth.getBalance(account);

    this.setState({ ethBalance: ethBalance });

  }



  // Create listeners for all events.

  loadEventListeners() {

    this.state.token.Transfer().watch((err, res) => {

      console.log(`Tokens Transferred! TxHash: ${res.transactionHash} \n ${JSON.stringify(res.args)}`);

      this.loadAccountBalances(this.web3.eth.accounts[this.state.defaultAccount]);

    });

  }



  // Buy new tokens with eth

  async buy(amount) {

    const sender = this.web3.eth.accounts[this.state.defaultAccount];

    const transactionHash = await this.state.token.buy({ from: sender, value: amount });

    console.log(transactionHash);

  }



  // Transfer tokens to a user

  async transfer(user, amount) {

    const sender  = this.web3.eth.accounts[this.state.defaultAccount];

    const transactionHash = await this.state.token.transfer(user, amount, { from: sender });

    console.log(transactionHash);

  }



  // When a new account in selected in the available accounts drop down.

  handleDropDownChange = (event, index, defaultAccount) => {

    this.setState({ defaultAccount });

    this.loadAccountBalances(this.state.availableAccounts[index].key);

  }



  render() {

    let component = <div style={{display: "flex", justifyContent: "space-around", flexWrap: "wrap"}}>

      <div style={{width: 200, height: 200, border: "1px solid rgb(221,221,221)"}}>

        <img src={clohtes} style={{maxHeight: "100%", maxWidth: "100%"}}/>
        Clothes $20

      </div>

      <div style={{width: 200, height: 200, border: "1px solid rgb(221,221,221)"}}>
        <img src={books} style={{maxHeight: "100%", maxWidth: "100%"}}/>
        School Supplies $15

      </div>
      <div style={{width: 200, height: 200, border: "1px solid rgb(221,221,221)"}}>
        <img src={donate} style={{maxHeight: "100%", maxWidth: "100%"}}/>
        Or donate $10, $20, $50!
      </div>
      </div>

    const newPage = <div>

      <Link to={'/'}>

        <RaisedButton label="Wallet <<<" primary={true} fullWidth={true}/>

      </Link>

    </div>



    return (

      <MuiThemeProvider>

        <div className="App">

          <header className="App-header">

            <img src={logo} alt="logo" style={{height: '90px', width: '540px'}}/>

          </header>

          <BrowserRouter>

            <div>

              <Route exact={true} path="/" render={() => component}/>

              <Route exact={true} path="/newPage" render={() => newPage} />

            </div>

          </BrowserRouter>

        </div>

      </MuiThemeProvider>

    );

  }

}



export default App;