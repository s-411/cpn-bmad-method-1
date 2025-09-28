// Placeholder card generator for build compatibility
// This will be implemented when sharing feature is developed

export interface ShareCard {
  id: string
  title: string
  data: any
  imageUrl?: string
}

export class CardGenerator {
  static async generateCard(data: any): Promise<ShareCard> {
    return {
      id: 'placeholder',
      title: 'Share Card',
      data,
      imageUrl: undefined,
    }
  }

  static async generateImage(card: ShareCard): Promise<string> {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNQTiBTaGFyZTwvdGV4dD4KICA8L3N2Zz4K'
  }

  static async generateInstagramStoryCard(data: any): Promise<Blob> {
    // Create a placeholder image blob for Instagram Story format (1080x1920)
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Fill background
    ctx.fillStyle = '#212121'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add text
    ctx.fillStyle = '#ffffff'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('CPN Share Story', canvas.width / 2, canvas.height / 2)

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob())
      }, 'image/png')
    })
  }
}