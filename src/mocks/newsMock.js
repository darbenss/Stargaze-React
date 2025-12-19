// src/mocks/newsMock.js

export const MOCK_NEWS_RESPONSE = {
  data: [
    {
      id: 1,
      attributes: {
        title: "Global Summit Announces New Climate Initiatives",
        headline: "Climate Change Breakthrough",
        published_at: "2023-10-15T09:00:00Z",
        excerpt: "World leaders gathered today to announce a groundbreaking agreement on carbon emissions...",
        cover_picture: {
          data: {
            attributes: {
              url: "https://placehold.co/600x400?text=Climate+Summit"
            }
          }
        }
      }
    },
    {
      id: 2,
      attributes: {
        title: "Tech Giant Reveals Latest AI Processor",
        published_at: "2023-11-02T14:30:00Z",
        summary: "The new chip promises 50% faster processing speeds for machine learning tasks.",
        cover_picture: {
          data: {
            attributes: {
              url: "https://placehold.co/600x400?text=AI+Chip"
            }
          }
        }
      }
    },
    {
      id: 3,
      attributes: {
        title: "Local Art Exhibition Opens Downtown",
        date: "2023-12-05", // Legacy format variation
        content: "A collection of modern art from local artists is now on display at the city gallery.",
        cover_picture: null // Test fallback image
      }
    }
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 8,
      pageCount: 5,
      total: 35
    }
  }
};