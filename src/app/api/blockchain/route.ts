// API Route untuk mendapatkan informasi blockchain
// File: src/app/api/blockchain/route.ts

import { NextRequest, NextResponse } from 'next/server' // Next.js API utilities
import { ethers } from 'ethers' // Ethers.js library untuk blockchain interactions

// Interface untuk response yang terstruktur
interface BlockchainInfo {
  // Interface untuk mendefinisikan struktur response data
  gasPrice: string // Harga gas saat ini dalam Gwei
  blockNumber: number // Nomor block terakhir
  network: string // Nama network
  chainId: number // ID dari chain
  ethPrice: number // Harga ETH dalam USD (mock data)
}

// Interface untuk balance response
interface BalanceResponse {
  // Interface untuk response data saldo
  address: string // Alamat wallet
  balance: string // Saldo ETH
  usdValue: number // Nilai dalam USD
  tokens: TokenBalance[] // Array saldo token
}

interface TokenBalance {
  // Interface untuk data token
  symbol: string // Simbol token
  balance: string // Saldo token
  usdValue: number // Nilai dalam USD
  contractAddress: string // Alamat kontrak
}

// GET handler untuk mendapatkan informasi blockchain
export async function GET(request: NextRequest) {
  try {
    // Ambil query parameter dari request URL
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address') // Alamat wallet dari query param
    const action = searchParams.get('action') // Aksi yang diminta (info/balance)

    // Mock data untuk development (tanpa API key)
    const mockBlockchainInfo: BlockchainInfo = {
      gasPrice: (15 + Math.random() * 10).toFixed(2), // Random gas price 15-25 Gwei
      blockNumber: 12345678 + Math.floor(Math.random() * 1000), // Random block number
      network: 'Ethereum Mainnet',
      chainId: 1,
      ethPrice: 2000 + Math.random() * 500, // Random ETH price 2000-2500
    }

    if (action === 'info') {
      // Jika action = info, kembalikan informasi blockchain
      return NextResponse.json(mockBlockchainInfo)
    }

    if (action === 'balance' && address) {
      // Jika action = balance dan ada address, kembalikan saldo
      if (!ethers.isAddress(address)) {
        // Validasi alamat Ethereum
        return NextResponse.json(
          { error: 'Invalid Ethereum address' },
          { status: 400 } // Bad request status
        )
      }

      // Mock balance data
      const mockBalance = (Math.random() * 10).toFixed(6) // Random 0-10 ETH
      
      // Mock token balances
      const tokens: TokenBalance[] = [
        {
          symbol: 'USDC',
          balance: (Math.random() * 5000).toFixed(2),
          usdValue: parseFloat((Math.random() * 5000).toFixed(2)),
          contractAddress: '0xA0b86a33E6417c5c7c4c4c4c4c4c4c4c4c4c4c4c',
        },
        {
          symbol: 'USDT',
          balance: (Math.random() * 3000).toFixed(2),
          usdValue: parseFloat((Math.random() * 3000).toFixed(2)),
          contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        },
        {
          symbol: 'DAI',
          balance: (Math.random() * 2000).toFixed(2),
          usdValue: parseFloat((Math.random() * 2000).toFixed(2)),
          contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        },
      ]

      // Format response
      const response: BalanceResponse = {
        address,
        balance: mockBalance,
        usdValue: parseFloat(mockBalance) * mockBlockchainInfo.ethPrice,
        tokens,
      }

      return NextResponse.json(response)
    }

    // Jika tidak ada action yang valid
    return NextResponse.json(
      { error: 'Invalid action. Use ?action=info or ?action=balance&address=0x...' },
      { status: 400 }
    )

  } catch (error) {
    // Error handling
    console.error('Blockchain API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 } // Internal server error
    )
  }
}

// POST handler untuk transaksi atau interaksi blockchain
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body dari request
    const body = await request.json()
    const { to, value, data } = body // Extract data dari body

    // Validasi input
    if (!to || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: to, value' },
        { status: 400 }
      )
    }

    // Validasi alamat
    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      )
    }

    // Mock transaction data untuk development
    const mockGasEstimate = 21000 + Math.floor(Math.random() * 50000) // 21k-71k gas
    const mockGasPrice = (15 + Math.random() * 10).toFixed(2) // 15-25 Gwei
    const mockTotalCost = (mockGasEstimate * parseFloat(mockGasPrice) / Math.pow(10, 9)).toFixed(6)

    // Response dengan estimasi biaya mock
    return NextResponse.json({
      success: true,
      gasEstimate: mockGasEstimate.toString(),
      gasPrice: mockGasPrice,
      totalCost: mockTotalCost,
      message: 'Transaction ready to be signed by user (Mock Data)',
    })

  } catch (error) {
    console.error('Transaction API Error:', error)
    return NextResponse.json(
      { 
        error: 'Transaction failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}