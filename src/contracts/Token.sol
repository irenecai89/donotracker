pragma solidity ^0.4.24;


contract Token {
  string public constant symbol = 'BLG';
  string public constant name = 'Blockchain Learning Group Token';
  uint public constant rate = 2;  // rate of token / wei for purchase
  uint256 private totalSupply_;
  mapping (address => uint256) private balances_;

  event Transfer(address indexed from, address indexed to, uint value);
  event TokensMinted(address indexed to, uint256 value, uint256 totalSupply);

  constructor() {}

  // Buy tokens with ether, mint and allocate new tokens to the purchaser.
  function buy() external payable returns (bool)
  {
    require(msg.value > 0, 'Cannot buy with a value of <= 0, Token.buy()');

    uint256 tokenAmount = msg.value * rate;

    totalSupply_ += tokenAmount;   // NOTE overflow
    balances_[msg.sender] += tokenAmount; // NOTE overflow

    emit TokensMinted(msg.sender, msg.value, totalSupply_);
    emit Transfer(address(0), msg.sender, msg.value);

    return true;
  }

  // Transfer value to another address
  function transfer (
    address _to,
    uint256 _value
  ) external
    returns (bool)
  {
    require(balances_[msg.sender] >= _value, 'Sender balance is insufficient, Token.transfer()');

    balances_[msg.sender] -= _value;  // NOTE underflow
    balances_[_to] += _value;  // NOTE overflow

    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  // return the address' balance
  function balanceOf(
    address _owner
  ) external
    constant
    returns (uint256)
  {
    return balances_[_owner];
  }

  // return total amount of tokens.
  function totalSupply()
    external
    constant
    returns (uint256)
  {
    return totalSupply_;
  }
}
