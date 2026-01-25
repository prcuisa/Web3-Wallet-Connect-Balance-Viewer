// Type declaration untuk MetaMask dan Web3 wallet
// File: src/types/ethereum.d.ts

declare global {
  interface Window {
    // Interface untuk window.ethereum yang disediakan oleh MetaMask
    ethereum: {
      // Fungsi untuk request akses ke akun wallet
      request: (args: {
        method: string // Method yang akan dipanggil
        params?: any[] // Parameter untuk method (optional)
      }) => Promise<any> // Return Promise dengan hasil

      // Event listener untuk perubahan state
      on: (event: string, handler: (...args: any[]) => void) => void // Add event listener
      removeListener: (event: string, handler: (...args: any[]) => void) => void // Remove event listener

      // Informasi tentang provider
      isMetaMask?: boolean // Flag apakah ini MetaMask
      isConnected?: () => boolean // Cek koneksi status
    }
  }
}

export {} // Export kosong agar file ini dianggap sebagai module