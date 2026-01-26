'use client'

// Import library yang dibutuhkan untuk Web3 dan UI
import { useState, useEffect } from 'react' // React hooks untuk state management dan lifecycle
import { Button } from '@/components/ui/button' // UI component untuk tombol
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card' // UI component untuk card layout
import { Badge } from '@/components/ui/badge' // UI component untuk badge/label
import { Separator } from '@/components/ui/separator' // UI component untuk garis pemisah
import { Alert, AlertDescription } from '@/components/ui/alert' // UI component untuk notifikasi
import { Loader2, Wallet, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react' // Icons dari lucide-react
import { toast } from 'sonner' // Library untuk toast notifications

// Tipe data untuk TypeScript agar kode lebih aman dan terstruktur
interface WalletState {
  // Interface untuk mendefinisikan struktur data wallet
  isConnected: boolean // Status koneksi wallet
  address: string | null // Alamat wallet pengguna
  balance: string | null // Saldo ETH dalam format string
  network: string | null // Nama network yang terhubung
  chainId: number | null // ID dari blockchain network
  isLoading: boolean // Status loading untuk async operations
  error: string | null // Pesan error jika ada masalah
}

interface Transaction {
  // Interface untuk data transaksi
  hash: string // Hash transaksi (unique identifier)
  from: string // Alamat pengirim
  to: string | null // Alamat penerima (null untuk contract creation)
  value: string // Jumlah ETH yang ditransfer
  gasUsed: string // Gas yang digunakan
  gasPrice: string // Harga gas
  blockNumber: number // Nomor block
  timestamp: number // Waktu transaksi
  status: 'success' | 'pending' | 'failed' // Status transaksi
}

interface TokenBalance {
  // Interface untuk data saldo token ERC-20
  symbol: string // Simbol token (misal: USDC, USDT)
  balance: string // Jumlah saldo token
  decimals: number // Jumlah desimal token
  contractAddress: string // Alamat kontrak token
}

export default function Web3Wallet() {
  // State management menggunakan React hooks
  const [walletState, setWalletState] = useState<WalletState>({
    // Inisialisasi state wallet dengan nilai default
    isConnected: false,
    address: null,
    balance: null,
    network: null,
    chainId: null,
    isLoading: false,
    error: null
  })

  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]) // State untuk menyimpan saldo token ERC-20
  const [transactions, setTransactions] = useState<Transaction[]>([]) // State untuk menyimpan history transaksi
  const [isRefreshing, setIsRefreshing] = useState(false) // State untuk loading refresh

  // useEffect untuk check koneksi wallet saat component pertama kali di-load
  useEffect(() => {
    // useEffect adalah React hook yang dijalankan saat component mount
    checkWalletConnection() // Cek apakah wallet sudah terhubung
  }, []) // Empty array berarti hanya dijalankan sekali saat component mount

  // Fungsi untuk mengambil history transaksi
  const fetchTransactions = async (address: string) => {
    try {
      // Menggunakan Etherscan API (gunakan API key di production)
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'demo'
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === '1' && data.result) {
          // Format transaksi ke dalam bentuk yang lebih mudah dibaca
          const formattedTransactions: Transaction[] = data.result.slice(0, 10).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value) / Math.pow(10, 18)).toFixed(6), // Konversi Wei ke ETH
            gasUsed: tx.gasUsed,
            gasPrice: (parseInt(tx.gasPrice) / Math.pow(10, 9)).toFixed(2), // Konversi Wei ke Gwei
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp),
            status: tx.isError === '0' ? 'success' : 'failed' // Cek status transaksi
          }))
          setTransactions(formattedTransactions) // Update state dengan transaksi
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // Mock data untuk development
      const mockTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          from: address,
          to: '0x9876543210fedcba9876543210fedcba98765432',
          value: '0.123456',
          gasUsed: '21000',
          gasPrice: '20.5',
          blockNumber: 12345678,
          timestamp: Date.now() - 3600000, // 1 jam yang lalu
          status: 'success'
        }
      ]
      setTransactions(mockTransactions)
    }
  }

  // Fungsi untuk mengecek koneksi wallet yang sudah ada
  const checkWalletConnection = async () => {
    try {
      // Cek apakah MetaMask (atau wallet lain) terinstall di browser
      if (typeof window !== 'undefined' && window.ethereum) {
        // window.ethereum adalah object yang disediakan oleh MetaMask
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' // Request untuk mendapatkan akun yang sudah terhubung
        })
        
        if (accounts.length > 0) {
          // Jika ada akun yang terhubung, update state
          await connectWallet() // Hubungkan wallet dan update data
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error) // Log error untuk debugging
    }
  }

  // Fungsi utama untuk menghubungkan wallet
  const connectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null })) // Set loading state
      
      // Request akses ke wallet MetaMask
      // eth_requestAccounts akan membuka popup MetaMask untuk meminta izin
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts' // Method untuk request akses akun
      })

      if (accounts.length === 0) {
        // Jika tidak ada akun yang dikembalikan
        throw new Error('No accounts found') // Lempar error
      }

      const address = accounts[0] // Ambil alamat akun pertama
      
      // Dapatkan informasi network yang sedang terhubung
      const chainId = await window.ethereum.request({
        method: 'eth_chainId' // Method untuk mendapatkan chain ID
      })
      
      // Dapatkan saldo ETH dari alamat wallet
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance', // Method untuk mendapatkan saldo
        params: [address, 'latest'] // Parameter: alamat dan block 'latest'
      })
      
      // Konversi saldo dari Wei (satuan terkecil ETH) ke ETH
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18)
      
      // Dapatkan nama network berdasarkan chain ID
      const networkName = getNetworkName(parseInt(chainId, 16))

      // Update state dengan data wallet yang lengkap
      setWalletState({
        isConnected: true,
        address,
        balance: balanceEth.toFixed(6), // Format saldo dengan 6 desimal
        network: networkName,
        chainId: parseInt(chainId, 16),
        isLoading: false,
        error: null
      })

      // Setelah wallet terhubung, ambil saldo token ERC-20
      await fetchTokenBalances(address)
      
      // Ambil history transaksi
      await fetchTransactions(address)
      
      // Tampilkan toast notifikasi sukses
      toast.success('Wallet connected successfully! 🎉')
      
    } catch (error) {
      // Handle error jika koneksi gagal
      console.error('Error connecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      toast.error('Failed to connect wallet 😔')
    }
  }

  // Fungsi untuk disconnect wallet
  const disconnectWallet = () => {
    // Reset state ke nilai awal
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      chainId: null,
      isLoading: false,
      error: null
    })
    setTokenBalances([]) // Kosongkan saldo token
    setTransactions([]) // Kosongkan history transaksi
    toast.info('Wallet disconnected') // Tampilkan notifikasi
  }

  // Fungsi untuk refresh data wallet
  const refreshWalletData = async () => {
    if (!walletState.address) return // Return jika tidak ada alamat
    
    setIsRefreshing(true) // Set loading state
    try {
      // Ambil ulang saldo ETH
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [walletState.address, 'latest']
      })
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18)
      
      // Update state dengan saldo baru
      setWalletState(prev => ({
        ...prev,
        balance: balanceEth.toFixed(6)
      }))
      
      // Refresh saldo token
      await fetchTokenBalances(walletState.address)
      
      // Refresh history transaksi
      await fetchTransactions(walletState.address)
      
      toast.success('Data refreshed! 🔄') // Notifikasi sukses
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false) // Reset loading state
    }
  }

  // Fungsi untuk mengambil saldo token ERC-20
  const fetchTokenBalances = async (address: string) => {
    try {
      // List token populer di Ethereum Mainnet
      const tokens = [
        {
          symbol: 'USDC',
          contractAddress: '0xA0b86a33E6417c5c7c4c4c4c4c4c4c4c4c4c4c4c', // Contoh address
          decimals: 6 // USDC punya 6 desimal
        },
        {
          symbol: 'USDT',
          contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Real USDT address
          decimals: 6 // USDT punya 6 desimal
        },
        {
          symbol: 'DAI',
          contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Real DAI address
          decimals: 18 // DAI punya 18 desimal
        }
      ]

      const balances: TokenBalance[] = []

      // Loop melalui setiap token untuk ambil saldo
      for (const token of tokens) {
        try {
          // Buat call data untuk balanceOf function ERC-20
          // balanceOf(address) adalah function standard ERC-20
          const callData = '0x70a08231' + // Function selector untuk balanceOf
            address.slice(2).padStart(64, '0') // Parameter address dipadding menjadi 64 hex chars

          // Call ke smart contract untuk mendapatkan saldo
          const result = await window.ethereum.request({
            method: 'eth_call', // Method untuk call smart contract
            params: [{
              to: token.contractAddress, // Alamat kontrak token
              data: callData // Data call yang berisi function dan parameter
            }, 'latest'] // Block number 'latest'
          })

          // Konversi hasil dari hex ke desimal
          const balanceWei = parseInt(result, 16)
          const balance = balanceWei / Math.pow(10, token.decimals) // Konversi berdasarkan desimal token

          // Tambahkan ke array balances jika saldo > 0
          if (balance > 0) {
            balances.push({
              symbol: token.symbol,
              balance: balance.toFixed(2), // Format dengan 2 desimal
              decimals: token.decimals,
              contractAddress: token.contractAddress
            })
          }
        } catch (error) {
          // Skip token jika error (misal token tidak ada di network)
          console.log(`Error fetching ${token.symbol} balance:`, error)
        }
      }

      setTokenBalances(balances) // Update state dengan saldo token
    } catch (error) {
      console.error('Error fetching token balances:', error)
    }
  }

  // Fungsi untuk mendapatkan nama network berdasarkan chain ID
  const getNetworkName = (chainId: number): string => {
    // Mapping chain ID ke nama network yang human-readable
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet', // Network utama Ethereum
      3: 'Ropsten Testnet', // Testnet (deprecated)
      4: 'Rinkeby Testnet', // Testnet (deprecated)
      5: 'Goerli Testnet', // Testnet
      11155111: 'Sepolia Testnet', // Testnet yang masih aktif
      137: 'Polygon Mainnet', // Layer 2 solution
      80001: 'Mumbai Testnet', // Polygon testnet
      56: 'BSC Mainnet', // Binance Smart Chain
      97: 'BSC Testnet', // BSC testnet
      42161: 'Arbitrum One', // Layer 2 solution
      10: 'Optimism', // Layer 2 solution
    }
    return networks[chainId] || `Unknown Network (Chain ID: ${chainId})` // Default jika tidak dikenali
  }

  // Fungsi utilitas untuk copy alamat ke clipboard
  const copyAddress = async () => {
    if (!walletState.address) return
    
    try {
      await navigator.clipboard.writeText(walletState.address) // Copy ke clipboard
      toast.success('Address copied to clipboard! 📋') // Notifikasi sukses
    } catch (error) {
      console.error('Failed to copy address:', error)
      toast.error('Failed to copy address')
    }
  }

  // Fungsi untuk membuka alamat di block explorer
  const openInExplorer = () => {
    if (!walletState.address || !walletState.chainId) return
    
    // Pilih block explorer berdasarkan network
    let explorerUrl = ''
    switch (walletState.chainId) {
      case 1: // Ethereum Mainnet
        explorerUrl = `https://etherscan.io/address/${walletState.address}`
        break
      case 137: // Polygon
        explorerUrl = `https://polygonscan.com/address/${walletState.address}`
        break
      case 56: // BSC
        explorerUrl = `https://bscscan.com/address/${walletState.address}`
        break
      default:
        // Default ke Etherscan untuk unknown networks
        explorerUrl = `https://etherscan.io/address/${walletState.address}`
    }
    
    window.open(explorerUrl, '_blank') // Buka di tab baru
  }

  // Fungsi utilitas untuk format alamat agar lebih pendek
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}` // Format: 0x1234...5678
  }

  // Fungsi untuk format timestamp menjadi waktu yang readable
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000) // Konversi Unix timestamp ke milliseconds
    return date.toLocaleString() // Format ke local string
  }

  // Fungsi untuk copy transaction hash
  const copyTransactionHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      toast.success('Transaction hash copied! 📋')
    } catch (error) {
      console.error('Failed to copy transaction hash:', error)
      toast.error('Failed to copy transaction hash')
    }
  }

  // Fungsi untuk buka transaksi di block explorer
  const openTransactionInExplorer = (hash: string) => {
    let explorerUrl = ''
    if (walletState.chainId === 1) {
      explorerUrl = `https://etherscan.io/tx/${hash}`
    } else if (walletState.chainId === 137) {
      explorerUrl = `https://polygonscan.com/tx/${hash}`
    } else {
      explorerUrl = `https://etherscan.io/tx/${hash}`
    }
    window.open(explorerUrl, '_blank')
  }

  // Render UI utama
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Web3 Wallet Connect
          </h1>
          <p className="text-slate-600">
            Hubungkan wallet Anda dan lihat saldo blockchain.
          </p>
        </div>

  

        {/* Wallet Connection Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Koneksi Wallet
            </CardTitle>
            <CardDescription>
              Hubungkan wallet MetaMask Anda untuk mengakses dApps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!walletState.isConnected ? (
              // Tampilan saat wallet belum terhubung
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Klik tombol di bawah untuk menghubungkan wallet MetaMask Anda.
                </p>
                <Button 
                  onClick={connectWallet} 
                  disabled={walletState.isLoading}
                  className="w-full"
                >
                  {walletState.isLoading ? (
                    // Tampilkan loading spinner saat sedang connect
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghubungkan...
                    </>
                  ) : (
                    // Tampilan normal
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Hubungkan Wallet
                    </>
                  )}
                </Button>
                
                {/* Error message jika ada */}
                {walletState.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{walletState.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              // Tampilan saat wallet sudah terhubung
              <div className="space-y-6">
                {/* Wallet Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Alamat Wallet</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                          {formatAddress(walletState.address!)}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={copyAddress}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={openInExplorer}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">Network</p>
                      <Badge variant="secondary" className="mt-1">
                        {walletState.network}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Balance Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900">Saldo ETH</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={refreshWalletData}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {walletState.balance} ETH
                    </p>
                  </div>

                  {/* Token Balances */}
                  {tokenBalances.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-3">Saldo Token</p>
                        <div className="space-y-2">
                          {tokenBalances.map((token, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-xs text-slate-500">
                                  {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
                                </p>
                              </div>
                              <p className="font-mono font-medium">
                                {token.balance}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Transaction History */}
                  {transactions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-3">History Transaksi</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {transactions.map((tx, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={tx.status === 'success' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}>
                                    {tx.status === 'success' ? '✓ Sukses' : tx.status === 'failed' ? '✗ Gagal' : '⏳ Pending'}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {formatTime(tx.timestamp)}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => copyTransactionHash(tx.hash)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openTransactionInExplorer(tx.hash)}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Dari:</span>
                                  <code className="text-xs">{formatAddress(tx.from)}</code>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Ke:</span>
                                  <code className="text-xs">{tx.to ? formatAddress(tx.to) : 'Contract Creation'}</code>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Jumlah:</span>
                                  <span className="font-medium">{tx.value} ETH</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Gas:</span>
                                  <span className="text-xs">{tx.gasUsed} @ {tx.gasPrice} Gwei</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Disconnect Button */}
                  <Button 
                    variant="destructive" 
                    onClick={disconnectWallet}
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tentang Web3 Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">🔐 Keamanan:</h4>
              <p className="text-sm text-slate-600">
                Wallet Anda tetap aman karena private key tidak pernah meninggalkan perangkat Anda.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🌐 Network:</h4>
              <p className="text-sm text-slate-600">
                Saat ini mendukung Ethereum Mainnet dan testnets. Pastikan Anda terhubung ke network yang benar.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">💰 Token:</h4>
              <p className="text-sm text-slate-600">
                Menampilkan saldo untuk token ERC-20 populer seperti USDC, USDT, dan DAI.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}