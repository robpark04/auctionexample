# Drop Contracts for testnet

## Build

```
npm i
```

```
npm run build
```

## Deploy

First fill out `./scripts/config.js`

```
npx hardhat deploy-basetoken --network rinkeby
```

Then add its address to the same config file before running:

```
npx hardhat verify-token --network rinkeby
```

Minter next

```
npx hardhat deploy-minter --network rinkeby
```

Then add minter address to the config.

```
npx hardhat verify-minter --network rinkeby
```

Auction Next

```
npx hardhat deploy-auction --network rinkeby
```

Then add auction address to the config.

```
npx hardhat verify-auction --network rinkeby
```

## Initialize

```
npx hardhat set-price --etherprice 0.15 --network rinkeby
npx hardhat grant-minter-role --network rinkeby
npx hardhat set-max-supply --maxsupply 5000 --network rinkeby
```

## Full sale

```
npx hardhat start-mint --network rinkeby

npx hardhat set-price --etherprice "0.3" --network rinkeby

npx hardhat set-price --etherprice "0.275" --network rinkeby

npx hardhat set-price --etherprice "0.25" --network rinkeby

npx hardhat set-price --etherprice "0.225" --network rinkeby

npx hardhat set-price --etherprice "0.2" --network rinkeby

npx hardhat set-price --etherprice "0.175" --network rinkeby

npx hardhat set-price --etherprice "0.15" --network rinkeby

npx hardhat set-price --etherprice "0.125" --network rinkeby

npx hardhat set-price --etherprice "0.1" --network rinkeby
```

## Sales

```
## Whitelist sale
npx hardhat set-minter-signer --network rinkeby
npx hardhat set-max-per-wallet --max 2 --network rinkeby
npx hardhat set-max-per-block --max 2 --network rinkeby

npx hardhat start-signed-mint --network rinkeby
```

## Auction

```
npx hardhat reserve-one --network rinkeby
npx hardhat send-to-auction --tokenid 1 --network rinkeby
npx hardhat create-auction --tokenid 1 --network rinkeby

npx hardhat settle-auction --network rinkeby
```
