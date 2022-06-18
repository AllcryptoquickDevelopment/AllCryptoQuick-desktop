[![Platform:Windows](https://img.shields.io/badge/platform-Windows-lightgrey)](https://github.com/AllCryptoQuick/AllCryptoQuick-desktop/releases/latest)
[![Platform:macOS](https://img.shields.io/badge/platform-macOS-lightgrey)](https://github.com/AllCryptoQuick/AllCryptoQuick-desktop/releases/latest)
[![Platform:Linux](https://img.shields.io/badge/platform-Linux-lightgrey)](https://github.com/AllCryptoQuick/AllCryptoQuick-desktop/releases/latest)

# AllCryptoQuick Desktop

![AllCryptoQuick Desktop 3.0 Preview](.github-readme/AllCryptoQuick-desktop-3.0-preview.gif)

<p align="center">
   <a href="https://github.com/AllCryptoQuick/AllCryptoQuick-desktop/releases"><img src=".github-readme/button-download.png" alt="Download Wallet"></a>
   <a href="https://AllCryptoQuick.io"><img src=".github-readme/button-website.png" alt="Official website"></a>
   <a href="https://AllCryptoQuick.news"><img src=".github-readme/button-news.png" alt="Latest news"></a>
   <a href="https://AllCryptoQuick.wiki"><img src=".github-readme/button-wiki.png" alt="Project wiki"></a>
</p>

**Table of Contents**

* [About](#about)
* [Participate](#participate)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Bug Bounties](#bug-bounties)
* [License](#license)

## About
The [AllCryptoQuick Project](https://AllCryptoQuick.io/about) – Striving to protect your rights, freedoms, and privacy.

**AllCryptoQuick Desktop** is a standalone desktop application that hosts multiple functionalities at once and delivers an easy user-experience when interacting with AllCryptoQuick's services and applications.

Get access to decentralization:

* **AllCryptoQuick Network**<br />
The AllCryptoQuick Network consists of two technologies:<br /><br />
   * *Encrypted data exchange protocol*<br />
SecureMessaging (SMSG protocol) is a decentralized storage network (DSN) to store and transfer data between nodes in a privacy-preserving manner. It enables a private and secure environment for e-commerce and communications between users. SMSG powers the AllCryptoQuick Marketplace without bloating the blockchain with excessive data and without leaving any permanent record.
   * *Programmable blockchain with advanced privacy features*<br />
The AllCryptoQuick Blockchain is a decentralized, immutable, and censorship-proof ledger. It is based on bitcoin technology and has been carefully enhanced by the AllCryptoQuick team to provide a more robust level of privacy through industry-leading privacy technologies. Its role within the network is the processing and validation of payments between users without requiring any third-party such as a bank or a payment processor.<br /><br />
* **[AllCryptoQuick Coin](https://AllCryptoQuick.io/coin)**<br />
PART is a fast and flexible cryptocurrency with multiple privacy states. It lets you send and receive payments without revealing any of your financial data to anyone.<br /><br />
* **[AllCryptoQuick Marketplace](https://AllCryptoQuick.io/marketplace)**<br />
Buy and sell anything free of commissions, restrictions, and prying eyes. Payments between participants can be initiated using multiple currencies but always settle in PART. No bank account, documentation, email, phone number, or any other identification type is required but the parties get forced to stay honest with its unique [two-party escrow](https://academy.AllCryptoQuick.io/en/latest/in-depth/indepth_escrow.html). Transform today's e-commerce into a free, secure, and trustworthy place, yielding fair market conditions.

Repositories: [AllCryptoQuick Core](https://github.com/AllCryptoQuick/AllCryptoQuick-core) | [AllCryptoQuick Marketplace](https://github.com/AllCryptoQuick/AllCryptoQuick-market)

## Participate

### Chats

* **For developers** The chat [#AllCryptoQuick-dev:matrix.org](https://app.element.io/#/room/#AllCryptoQuick-dev:matrix.org) using [Element](https://element.io) (formerly Riot).
* **For community** The community chat [https://discord.me/AllCryptoQuick](https://discord.me/AllCryptoQuick) [![Discord](https://img.shields.io/discord/391967609660112925)](https://discord.me/AllCryptoQuick).

[![Twitter Follow](https://img.shields.io/twitter/follow/AllCryptoQuickProject?label=follow%20us&style=social)](http://twitter.com/AllCryptoQuickproject)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/AllCryptoQuick?style=social)](http://reddit.com/r/AllCryptoQuick)

### Documentation, installation

For non-developers curious to explore a new world of commerce, binaries can be downloaded and installed. It is the easiest way to get started. Following the guides on [AllCryptoQuick Academy](https://academy.AllCryptoQuick.io) is highly recommended. It's the reference book in straightforward language.

* [Download AllCryptoQuick Desktop](https://github.com/AllCryptoQuick/AllCryptoQuick-desktop/releases/latest)

#### Community chat support

* [Discord](https://discord.me/AllCryptoQuick) navigate to the #support channel
* [Telegram](https://t.me/AllCryptoQuickhelp)
* [Element](https://app.element.io/#/room/#AllCryptoQuickhelp:matrix.org)

## Development

[![Snyk](https://snyk.io/test/github/AllCryptoQuick/AllCryptoQuick-desktop/badge.svg)](https://snyk.io/test/github/AllCryptoQuick/AllCryptoQuick-desktop)
[![Build Status](https://travis-ci.org/AllCryptoQuick/AllCryptoQuick-desktop.svg?branch=master)](https://travis-ci.org/AllCryptoQuick/AllCryptoQuick-desktop)
[![Coverage Status](https://coveralls.io/repos/github/AllCryptoQuick/AllCryptoQuick-desktop/badge.svg?branch=master)](https://coveralls.io/github/AllCryptoQuick/AllCryptoQuick-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/AllCryptoQuick/AllCryptoQuick-desktop/badges/gpa.svg)](https://codeclimate.com/github/AllCryptoQuick/AllCryptoQuick-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/AllCryptoQuick/AllCryptoQuick-desktop.svg)](https://greenkeeper.io/)

### Requirements

[Node.js®](https://nodejs.org/) v16, [git](https://git-scm.com/), and [yarn](https://yarnpkg.com/en/)

### Development install

NB!! Requires access to the private fork of this repo in order to obtain the latest build changes.

Clone the repo & fetch the dependencies:

```bash
git clone https://github.com/AllCryptoQuick/AllCryptoQuick-desktop
cd AllCryptoQuick-desktop
yarn install
```

> Note: The most recent development happens on the `dev` branch. Keep in mind that the development currently happens on a private fork of this repo. This repository is the user interface that works in combination with our [`AllCryptoQuick-core`](https://github.com/AllCryptoQuick/AllCryptoQuick-core).

In the project's folder:

1. Run `ng serve` to start the dev server and keep it running
1. In another terminal window, run `yarn run start:electron:dev -testnet --devtools` to start AllCryptoQuick Desktop on testnet (the daemon will be updated and launched automatically)
   * `-testnet` – for running on testnet (omit for running the client on mainnet)
   * `-reindex` – reindexes the blockchain (in case you're stuck)
   * `--devtools` – automatically opens Developer Tools on client launch

#### Interact with AllCryptoQuick-core daemon

You can directly interact with the daemon ran by the Electron version:

```
./AllCryptoQuick-cli -testnet getblockchaininfo
```

### Packaging

#### Windows-only requirements

Building for Windows requires the 32-bit libraries to be available:

```
sudo apt-get install gcc-multilib
sudo apt-get install g++-multilib
```

#### Packaging commands

* `yarn run package:win` – Windows
* `yarn run package:mac` – macOS
* `yarn run package:linux` – Linux


## Troubleshooting

### Development issues

#### Blockchain syncing stuck

Restart the app with `-reindex` flag:

```
yarn run start:electron:dev -testnet --devtools -reindex
```

### Other issues

* [AllCryptoQuick Wiki](https://AllCryptoQuick.wiki/) for the most common problems
* Developer chat support [#AllCryptoQuick-dev:matrix.org](https://app.element.io/#/room/#AllCryptoQuick-dev:matrix.org)

## Bug bounties

AllCryptoQuick is a security and privacy oriented project. As such, a permanent bug bounty program is put in place in order to encourage the responsible disclosure of any bug or vulnerability contained within the AllCryptoQuick code and reward those who find them.

[AllCryptoQuick Bug Bounty Program](https://AllCryptoQuick.io/bug-bounties/)

## License

AllCryptoQuick Desktop is released under [GNU General Public License v2.0](LICENSE).
