import React, { Component } from 'react';
import logo from './blg.jpg';
import './App.css';
import Web3 from 'web3'

// Material UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

// Build Artifacts
import tokenArtiacts from './build/contracts/Token.json'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ethBalance: 0,
      tokenBalance: 0,
      tokenSymbol: 0,
      tokenDecimals: 0,
      availableAccounts: [],
      defaultAccount: 0,
      mintUser: '',
      mintAmount: '',
      transferUser: '',
      transferAmount: '',
      token: null, // token contract
    }
  }

  componentDidMount() {
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

    // If connected load contracts
    if (this.web3.isConnected()) {
      // Retrieve available accounts
      this.web3.eth.getAccounts((err, accounts) => {
        const defaultAccount = this.web3.eth.accounts[0]

        // Append all available accounts
        for (let i = 0; i < accounts.length; i++) {
          this.setState({
            availableAccounts: this.state.availableAccounts.concat(
              <MenuItem value={i} key={accounts[i]} primaryText={accounts[i]} />
            )
          })
        }

        /************************
        * Set ETH balance below *
        ************************/
        this.web3.eth.getBalance(defaultAccount, (err, ethBalance) => {
          this.setState({ ethBalance })
        })

        // Get detected network and load the token contract
        this.web3.version.getNetwork(async (err, netId) => {
          // Create a reference object to the deployed token contract
          if (netId in tokenArtiacts.networks) {
            const tokenAddress = tokenArtiacts.networks[netId].address
            const token = this.web3.eth.contract(tokenArtiacts.abi).at(tokenAddress)
            this.setState({ token })

            /**************************
            * Set token balance below *
            **************************/
            token.balanceOf(defaultAccount, (err, tokenBalance) => {
              this.setState({ tokenBalance })
            })

            /*************************
            * Set token sybmol below *
            *************************/
            token.symbol((err, tokenSymbol) => {
              this.setState({ tokenSymbol })
            })

            /*********************************
            * Set token decimal places below *
            *********************************/
            token.decimals((err, tokenDecimals) => {
              this.setState({ tokenDecimals })
            })

            /********************************
            * Call loadEventListeners below *
            ********************************/
            this.loadEventListeners()
          } else {
            console.error('Token has not been deployed to the detected network.')
          }
        })
      })
    } else {
      console.error('Web3 is not connected.')
    }
  }

  /**
   * Load the accounts token and ether balances.
   * @param  {Address} account The user's ether address.
   */
  loadAccountBalances(account) {
    if (this.state.token) {
      /**************************
      * Set token balance below *
      **************************/
      this.state.token.balanceOf(account, (err, tokenBalance) => {
        this.setState({ tokenBalance })
      })

      /**************************
      * Set ETH balance below *
      **************************/
      this.web3.eth.getBalance(account, (err, ethBalance) => {
        this.setState({ ethBalance })
      })
    }
  }

  /**
   * Create listeners for all events.
   */
  loadEventListeners() {
    /**********************************
    * Watch tokens minted event below *
    **********************************/
    this.state.token.LogTokensMinted({ fromBlock: 'latest', toBlock: 'latest' })
    .watch((err, res) => {
      alert('Tokens Minted!')
      this.loadAccountBalances(this.web3.eth.accounts[this.state.defaultAccount])
    })

    /************************************
    * Watch tokens transfer event below *
    ************************************/
    this.state.token.Transfer({ fromBlock: 'latest', toBlock: 'latest' })
    .watch((err, res) => {
      alert('Tokens Transferred!')
      this.loadAccountBalances(this.web3.eth.accounts[this.state.defaultAccount])
    })

    /**********************************
    * Watch error emitted event below *
    **********************************/
    this.state.token.LogErrorString({ fromBlock: 'latest', toBlock: 'latest' })
    .watch((err, res) => {
      alert(res.args.errorString)
    })
  }

  /**
   * Mint new tokens to a user.
   * @param  {Address} user   The EOA to mint to.
   * @param  {Number} amount Amount of tokens to mint.
   */
  mint(user, amount) {
    // Confirm user seems to be a valid address
    if (user.length === 42 && amount > 0) {
      /*********************
      * Execute mint below *
      *********************/
      this.state.token.mint(
        user,
        amount*10**this.state.tokenDecimals, // Convert to correct decimal places
        { from: this.web3.eth.accounts[this.state.defaultAccount] },
        (err, res) => {
          console.log(err)
          console.log(res)
        }
      )
    }
  }

  /**
   * Mint new tokens to a user.
   * @param  {Address} user   The EOA to transfer to.
   * @param  {Number} amount Amount of tokens to transfer.
   */
  transfer(user, amount) {
    // Confirm user seems to be a valid address
    if (user.length === 42 && amount > 0) {
      /*******************************
      * Execute token transfer below *
      *******************************/
      this.state.token.transfer(
        user,
        amount*10**this.state.tokenDecimals, // Convert to correct decimal places
        { from: this.web3.eth.accounts[this.state.defaultAccount] },
        (err, res) => {
          console.log(err)
          console.log(res)
        }
      )
    }
  }

  /**
   * When a new account in selected in the available accounts drop down.
   */
  handleDropDownChange = (event, index, defaultAccount) => {
    this.setState({ defaultAccount })
    this.loadAccountBalances(this.state.availableAccounts[index].key)
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <img src={logo} alt="logo" style={{height: '150px', width: '350px'}}/>
          </header>

          <h3>Active Account</h3>
          <DropDownMenu
            maxHeight={300}
            width={500}
            value={this.state.defaultAccount}
            onChange={this.handleDropDownChange}
          >
            {this.state.availableAccounts}
          </DropDownMenu>

          <h3>Balances</h3>
          <p className="App-intro">{this.state.ethBalance / 1e18} ETH</p>
          <p className="App-intro">
            {this.state.tokenBalance / 10**this.state.tokenDecimals} {this.state.tokenSymbol}
          </p>

          <br />

          <div>
            <h3>Mint Tokens</h3>
            <TextField
              floatingLabelText="User to mint tokens to."
              style={{width: 400}}
              value={this.state.mintUser}
              onChange={(e, mintUser) => {
                this.setState({ mintUser })
              }}
            />

            <TextField
              floatingLabelText="Amount."
              style={{width: 100}}
              value={this.state.mintAmount}
              onChange={(e, mintAmount) => {
                this.setState({ mintAmount })
              }}
            />

            <RaisedButton
              label="Mint"
              labelPosition="before"
              primary={true}
              onClick={() => this.mint(this.state.mintUser, this.state.mintAmount)}
            />
          </div>

          <br />

          <div>
            <h3>Transfer Tokens</h3>
            <TextField
              floatingLabelText="User to transfer tokens to."
              style={{width: 400}}
              value={this.state.transferUser}
              onChange={(e, transferUser) => {
                this.setState({ transferUser })
              }}
            />

            <TextField
              floatingLabelText="Amount."
              style={{width: 100}}
              value={this.state.amount}
              onChange={(e, transferAmount) => {
                this.setState({ transferAmount })
              }}
            />

            <RaisedButton
              label="Transfer"
              labelPosition="before"
              primary={true}
              onClick={() => this.transfer(this.state.transferUser, this.state.transferAmount)}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
