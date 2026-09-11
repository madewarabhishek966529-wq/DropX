// Helper to generate dates in the past
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const sampleProducts = [
  {
    name: 'Apple iPhone 17 Pro (256 GB) - Natural Titanium',
    brand: 'Apple',
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    description: 'Featuring an aerospace-grade titanium design, A19 Pro chip, advanced 48MP triple-lens camera system with 5x optical zoom, and Ceramic Shield front protection.',
    currentPrice: 89999,
    stores: [
      { name: 'Amazon', price: 89999, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 91499, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 92999, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 119999 },
      { date: daysAgo(270), price: 114999 },
      { date: daysAgo(180), price: 104999 },
      { date: daysAgo(90), price: 98999 },
      { date: daysAgo(30), price: 94999 },
      { date: daysAgo(14), price: 92999 },
      { date: daysAgo(7), price: 91999 },
      { date: daysAgo(2), price: 89999 },
      { date: daysAgo(0), price: 89999 }
    ]
  },
  {
    name: 'Samsung Galaxy S25 Ultra 5G (Titanium Gray, 512 GB)',
    brand: 'Samsung',
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    description: 'Galaxy AI is here. Equipped with Snapdragon 8 Elite, built-in S Pen, 200MP quad camera setup, and a stunning 6.8-inch Dynamic AMOLED 2X 120Hz display.',
    currentPrice: 119999,
    stores: [
      { name: 'Amazon', price: 121999, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 119999, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 124999, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 139999 },
      { date: daysAgo(240), price: 134999 },
      { date: daysAgo(180), price: 129999 },
      { date: daysAgo(90), price: 126999 },
      { date: daysAgo(30), price: 124999 },
      { date: daysAgo(14), price: 122999 },
      { date: daysAgo(7), price: 121499 },
      { date: daysAgo(1), price: 119999 },
      { date: daysAgo(0), price: 119999 }
    ]
  },
  {
    name: 'OnePlus 13 5G (Midnight Black, 16GB RAM + 512GB)',
    brand: 'OnePlus',
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    description: 'Featuring 4th Gen Hasselblad Camera for Mobile, 6000mAh Glacier Battery with 100W SUPERVOOC charging, and 2K 120Hz ProXDR display with Aqua Touch 2.0.',
    currentPrice: 64999,
    stores: [
      { name: 'Amazon', price: 64999, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 65499, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 66999, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 69999 },
      { date: daysAgo(210), price: 68999 },
      { date: daysAgo(180), price: 67999 },
      { date: daysAgo(90), price: 66999 },
      { date: daysAgo(30), price: 66499 },
      { date: daysAgo(14), price: 65999 },
      { date: daysAgo(7), price: 65499 },
      { date: daysAgo(2), price: 64999 },
      { date: daysAgo(0), price: 64999 }
    ]
  },
  {
    name: 'ASUS ROG Strix SCAR 16 Gaming Laptop (Intel i9-14900HX, 32GB, 1TB SSD)',
    brand: 'ASUS',
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    description: 'Dominate esports with ROG Nebula HDR Mini LED 240Hz/3ms display, Tri-Fan technology, Conductonaut Extreme liquid metal cooling, and per-key RGB keyboard.',
    currentPrice: 189990,
    stores: [
      { name: 'Amazon', price: 189990, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 194990, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 199990, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 219990 },
      { date: daysAgo(240), price: 214990 },
      { date: daysAgo(180), price: 204990 },
      { date: daysAgo(90), price: 199990 },
      { date: daysAgo(30), price: 195990 },
      { date: daysAgo(14), price: 192990 },
      { date: daysAgo(7), price: 191490 },
      { date: daysAgo(1), price: 189990 },
      { date: daysAgo(0), price: 189990 }
    ]
  },
  {
    name: 'Acer Predator Helios 16 RTX 5060 Laptop (Core i7-14700HX, 16GB, 1TB SSD)',
    brand: 'Acer',
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    description: 'High-performance gaming machine boasting NVIDIA GeForce RTX 5060 8GB GDDR7 Graphics, 165Hz WQXGA IPS display, dual 5th Gen AeroBlade 3D Fans, and Killer Wi-Fi 7.',
    currentPrice: 124999,
    stores: [
      { name: 'Amazon', price: 129999, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 124999, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 127990, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 149999 },
      { date: daysAgo(260), price: 144999 },
      { date: daysAgo(180), price: 139999 },
      { date: daysAgo(90), price: 134999 },
      { date: daysAgo(30), price: 129999 },
      { date: daysAgo(14), price: 127999 },
      { date: daysAgo(7), price: 126499 },
      { date: daysAgo(2), price: 124999 },
      { date: daysAgo(0), price: 124999 }
    ]
  },
  {
    name: 'Lenovo Legion Pro 7i RTX 5070 Laptop (Core i9, 32GB, 2TB SSD)',
    brand: 'Lenovo',
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    description: 'AI-tuned performance powerhouse featuring Coldfront Vapor Chamber cooling, Lenovo LA-2 AI chip, 16" PureSight Gaming Display with 240Hz variable refresh rate.',
    currentPrice: 174990,
    stores: [
      { name: 'Amazon', price: 174990, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 179990, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 182000, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 194990 },
      { date: daysAgo(250), price: 189990 },
      { date: daysAgo(180), price: 184990 },
      { date: daysAgo(90), price: 181990 },
      { date: daysAgo(30), price: 178990 },
      { date: daysAgo(14), price: 176990 },
      { date: daysAgo(7), price: 175990 },
      { date: daysAgo(1), price: 174990 },
      { date: daysAgo(0), price: 174990 }
    ]
  },
  {
    name: 'Apple MacBook Pro 16" M4 Max (36GB Unified Memory, 1TB SSD) - Space Black',
    brand: 'Apple',
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'The supreme workstation laptop with Liquid Retina XDR display, up to 24 hours of battery life, hardware-accelerated ray tracing, and studio-grade microphones.',
    currentPrice: 239900,
    stores: [
      { name: 'Amazon', price: 239900, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 244900, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 249900, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 259900 },
      { date: daysAgo(280), price: 254900 },
      { date: daysAgo(180), price: 249900 },
      { date: daysAgo(90), price: 245900 },
      { date: daysAgo(30), price: 242900 },
      { date: daysAgo(14), price: 241500 },
      { date: daysAgo(7), price: 240900 },
      { date: daysAgo(2), price: 239900 },
      { date: daysAgo(0), price: 239900 }
    ]
  },
  {
    name: 'NVIDIA GeForce RTX 5080 16GB GDDR7 Graphics Card',
    brand: 'NVIDIA',
    category: 'PC & GPUs',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    description: 'Powered by the revolutionary Blackwell architecture, DLSS 4 with multi-frame generation, full path tracing acceleration, and dual flow-through cooling system.',
    currentPrice: 98500,
    stores: [
      { name: 'Amazon', price: 104999, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 98500, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 109990, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 118999 },
      { date: daysAgo(260), price: 114999 },
      { date: daysAgo(180), price: 109999 },
      { date: daysAgo(90), price: 106500 },
      { date: daysAgo(30), price: 102900 },
      { date: daysAgo(14), price: 99990 },
      { date: daysAgo(7), price: 98900 },
      { date: daysAgo(1), price: 98500 },
      { date: daysAgo(0), price: 98500 }
    ]
  },
  {
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Integrated Processor V1 and HD Noise Cancelling Processor QN1, 8 microphones for noise cancellation, Auto NC Optimizer, 30 hours of battery life with quick charging.',
    currentPrice: 24990,
    stores: [
      { name: 'Amazon', price: 24990, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 26490, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 28990, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 34990 },
      { date: daysAgo(240), price: 32990 },
      { date: daysAgo(180), price: 29990 },
      { date: daysAgo(90), price: 27990 },
      { date: daysAgo(30), price: 26490 },
      { date: daysAgo(14), price: 25990 },
      { date: daysAgo(7), price: 25490 },
      { date: daysAgo(1), price: 24990 },
      { date: daysAgo(0), price: 24990 }
    ]
  },
  {
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium Case',
    brand: 'Apple',
    category: 'Smartwatches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'The most capable and rugged Apple Watch ever. S9 SiP chip, 3000-nit display, double tap gesture, dual-frequency precision GPS, and 100m water resistance.',
    currentPrice: 79900,
    stores: [
      { name: 'Amazon', price: 79900, url: 'https://www.amazon.in' },
      { name: 'Flipkart', price: 82900, url: 'https://www.flipkart.com' },
      { name: 'Croma', price: 84900, url: 'https://www.croma.com' }
    ],
    priceHistory: [
      { date: daysAgo(365), price: 89900 },
      { date: daysAgo(270), price: 87900 },
      { date: daysAgo(180), price: 84900 },
      { date: daysAgo(90), price: 82900 },
      { date: daysAgo(30), price: 81500 },
      { date: daysAgo(14), price: 80900 },
      { date: daysAgo(7), price: 80200 },
      { date: daysAgo(2), price: 79900 },
      { date: daysAgo(0), price: 79900 }
    ]
  }
];

module.exports = sampleProducts;
