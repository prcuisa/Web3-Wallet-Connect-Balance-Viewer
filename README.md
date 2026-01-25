# Web3 Wallet Connect + Balance Viewer

Aplikasi Web3 yang lengkap untuk menghubungkan wallet MetaMask dan melihat saldo blockchain dengan penjelasan kode detail untuk pemula.

## 🚀 Features

- **Wallet Connection**: Hubungkan wallet MetaMask dengan aman
- **Balance Viewer**: Lihat saldo ETH dan token ERC-20
- **Transaction History**: Riwayat transaksi lengkap dengan detail
- **Blockchain Info**: Informasi real-time tentang gas price, block number, dll
- **Multi-Network Support**: Support Ethereum, Polygon, dan testnets
- **Responsive Design**: UI yang modern dan mobile-friendly

## 🛠 Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Ethers.js, Web3.js
- **Backend API**: Next.js API Routes
- **UI Components**: Lucide Icons, Sonner Toasts

## 📋 Penjelasan Kode

### 1. Import Statements
```typescript
import { useState, useEffect } from 'react' // React hooks untuk state management
import { ethers } from 'ethers' // Library untuk blockchain interactions
```
- `useState`: Hook untuk mengelola state component
- `useEffect`: Hook untuk side effects (API calls, subscriptions)
- `ethers`: Library Web3 paling populer untuk Ethereum

### 2. Type Definitions
```typescript
interface WalletState {
  isConnected: boolean // Status koneksi wallet
  address: string | null // Alamat wallet pengguna
  balance: string | null // Saldo ETH
  network: string | null // Nama network
  chainId: number | null // ID blockchain
  isLoading: boolean // Status loading
  error: string | null // Pesan error
}
```
Interface memastikan type safety dan memudahkan development dengan autocomplete.

### 3. State Management
```typescript
const [walletState, setWalletState] = useState<WalletState>({
  isConnected: false,
  address: null,
  balance: null,
  network: null,
  chainId: null,
  isLoading: false,
  error: null
})
```
- Menggunakan React hooks untuk state management
- Inisialisasi dengan nilai default yang aman

### 4. Wallet Connection
```typescript
const connectWallet = async () => {
  try {
    // Request akses ke wallet MetaMask
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    
    // Dapatkan informasi wallet
    const address = accounts[0]
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    })
    
    // Konversi Wei ke ETH (1 ETH = 10^18 Wei)
    const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18)
    
  } catch (error) {
    // Error handling
  }
}
```
Penjelasan:
- `eth_requestAccounts`: Minta izin akses wallet
- `eth_getBalance`: Ambil saldo dari alamat
- Wei adalah satuan terkecil ETH (10^18 Wei = 1 ETH)

### 5. Token Balances
```typescript
const fetchTokenBalances = async (address: string) => {
  // Buat call data untuk balanceOf function ERC-20
  const callData = '0x70a08231' + // Function selector
    address.slice(2).padStart(64, '0') // Parameter address
  
  // Call ke smart contract
  const result = await window.ethereum.request({
    method: 'eth_call',
    params: [{
      to: token.contractAddress, // Alamat kontrak
      data: callData // Data call
    }, 'latest']
  })
}
```
Penjelasan:
- `0x70a08231`: Function selector untuk `balanceOf(address)`
- Smart contract calls menggunakan encoded data
- Setiap token ERC-20 punya interface yang sama

### 6. Backend API
```typescript
export async function GET(request: NextRequest) {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`
  )
  
  const [gasPrice, blockNumber] = await Promise.all([
    provider.getFeeData(),
    provider.getBlockNumber()
  ])
}
```
Penjelasan:
- API Routes untuk server-side blockchain calls
- `Promise.all` untuk parallel execution
- Alchemy/Infura untuk reliable RPC connection

### 7. Error Handling
```typescript
try {
  // Blockchain operations
} catch (error) {
  console.error('Error:', error)
  setWalletState(prev => ({
    ...prev,
    error: error.message || 'Unknown error',
    isLoading: false
  }))
  toast.error('Operation failed 😔')
}
```
Penjelasan:
- Try-catch untuk async operations
- User-friendly error messages
- Toast notifications untuk feedback

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Variables
Buat file `.env.local`:
```env
# Alchemy API Key (gratis di alchemy.com)
ALCHEMY_API_KEY=your_alchemy_api_key

# Etherscan API Key (gratis di etherscan.io)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Run Development Server
```bash
bun run dev
```

## 📱 Cara Penggunaan

1. **Install MetaMask**: Download dari [metamask.io](https://metamask.io)
2. **Connect Wallet**: Klik tombol "Hubungkan Wallet"
3. **Grant Permission**: Approve di MetaMask popup
4. **View Balance**: Lihat saldo ETH dan token
5. **Check History**: Explore transaksi history
6. **Refresh Data**: Klik refresh untuk data terbaru

## 🌐 Network Support

- **Ethereum Mainnet**: Chain ID 1
- **Polygon**: Chain ID 137  
- **Sepolia Testnet**: Chain ID 11155111
- **Goerli Testnet**: Chain ID 5

## 🔒 Security Features

- **Private Key Safety**: Private key tidak pernah meninggalkan device
- **Read-Only**: Hanya membaca data, tidak ada transaksi tanpa persetujuan
- **Secure Connections**: HTTPS untuk semua API calls
- **Input Validation**: Validasi semua alamat dan input

## 📚 Blockchain Concepts

### Wei dan ETH
- **Wei**: Satuan terkecil Ethereum (10^-18 ETH)
- **ETH**: Satuan utama yang user-friendly
- **Konversi**: `1 ETH = 1,000,000,000,000,000,000 Wei`

### Gas dan Gas Price
- **Gas**: Unit untuk mengukur computational effort
- **Gas Price**: Harga per gas dalam Gwei
- **Total Cost**: Gas Used × Gas Price

### Smart Contract Calls
- **Function Selector**: 4 bytes pertama dari hash function name
- **Encoded Parameters**: Data yang di-encode sesuai ABI
- **eth_call**: Method untuk read-only contract calls

## 🚨 Important Notes

- **Testnets**: Gunakan testnets untuk development (gratis)
- **API Keys**: Jangan expose API keys di client-side
- **Network Fees**: Transaksi di mainnet memerlukan ETH untuk gas
- **Security**: Never share private keys atau seed phrases

## 🛠 Development Tips

1. **Start with Testnets**: Gunakan Sepolia atau Goerli
2. **Mock Data**: Gunakan mock data untuk development offline
3. **Error Boundaries**: Implement error boundaries untuk better UX
4. **Loading States**: Selalu tunjukkan loading untuk async ops
5. **Type Safety**: Manfaatkan TypeScript untuk prevent bugs

## 📞 Troubleshooting

### MetaMask Not Detected
- Pastikan MetaMask terinstall
- Refresh halaman setelah install
- Check browser compatibility

### Connection Failed
- Check network yang dipilih di MetaMask
- Pastikan ada koneksi internet
- Restart browser jika perlu

### Balance Not Showing
- Tunggu beberapa saat (API delay)
- Check alamat wallet yang benar
- Refresh data manually

## 🎯 Next Steps

1. **Transaction Features**: Add send/receive ETH
2. **Token Swaps**: Integrate DEX seperti Uniswap
3. **NFT Gallery**: Display NFT collections
4. **DeFi Integration**: Connect ke lending protocols
5. **Multi-Wallet**: Support WalletConnect, Coinbase Wallet

---

**Happy Coding! 🚀**