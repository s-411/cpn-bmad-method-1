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
}