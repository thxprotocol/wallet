# THX Wallet:

## Usage

1. Create account at https://thx-wallet-dev.firebaseapp.com/
2. Generate private keys for Rinkeby and Loom/Extdev networks
3. Connect account
4. Copy Loom Address and send it to the Pool Manager
5. The Pool Manager will add you as a member to the Reward Pool
6. Go to Pools overview (first nav item)
7. Join Reward Pool: `0xE7FA4ca3257F852a96de1543fb8B9f802C7be933`

### Reward Claim QR Image:
https://us-central1-thx-wallet-dev.cloudfunctions.net/api/qr/claim/:poolAddr/:ruleId

### Firebase Functions API (Dev):
https://us-central1-thx-wallet-dev.cloudfunctions.net/api

### Available endpoints:

```
curl https://us-central1-thx-wallet-dev.cloudfunctions.net/api/rules \
  -X GET
```

```
curl https://us-central1-thx-wallet-dev.cloudfunctions.net/api/rules/0 \
  -X GET
```

```
curl https://us-central1-thx-wallet-dev.cloudfunctions.net/api/rewards \
	-X POST \
	-H "Content-Type: application/json" \
	-d '{"pool": "0xE7FA4ca3257F852a96de1543fb8B9f802C7be933", "rule": "0"}'
```
