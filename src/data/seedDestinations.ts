import { Destination } from '../types/travel';

export const SEED_DESTINATIONS: Destination[] = [
  {
    id: 'dest-amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    continent: 'Europe',
    tagline: 'Sun-drenched cliffs, pastel villages, and coastal citrus groves',
    description: 'A masterpiece of Mediterranean drama, where vertical towns cling to terraced lemon groves and azure waters beckon along winding cliffside roads.',
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'May to October',
    averageDailyCost: 240,
    currency: 'EUR',
    highlights: ['Path of the Gods hike', 'Positano coastal sunset', 'Villa Cimbrone in Ravello', 'Artisanal limoncello tastings'],
    suggestedActivities: [
      {
        name: 'Hike the Path of the Gods (Sentiero degli Dei)',
        category: 'experience',
        estCost: 45,
        description: 'Spectacular cliff-edge trek from Bomerano to Nocelle with jaw-dropping views of Capri and the sea.'
      },
      {
        name: 'Private Gozzo Boat Charter to Capri',
        category: 'transport',
        estCost: 180,
        description: 'Sail through the Faraglioni sea rocks and discover secluded swimming coves.'
      },
      {
        name: 'Michelin Dining at Ristorante Marina Grande',
        category: 'food',
        estCost: 95,
        description: 'Fresh Mediterranean catch and handmade scialatielli pasta overlooking the Amalfi harbor.'
      }
    ]
  },
  {
    id: 'dest-kyoto',
    name: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    tagline: 'Ancient cedar shrines, meditative rock gardens, and tea ceremony heritage',
    description: 'The cultural soul of Japan, preserving thousands of classical Buddhist temples, Zen gardens, traditional wooden machiya houses, and geisha districts.',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'March to May & October to November',
    averageDailyCost: 180,
    currency: 'JPY',
    highlights: ['Fushimi Inari torii gates at dawn', 'Arashiyama Bamboo Grove', 'Traditional Kaiseki dinner in Gion', 'Kinkaku-ji Golden Pavilion'],
    suggestedActivities: [
      {
        name: 'Dawn Walk Through Fushimi Inari Taisha',
        category: 'sightseeing',
        estCost: 0,
        description: 'Ascend the sacred mountain path framed by over 10,000 crimson vermilion torii gates before crowds arrive.'
      },
      {
        name: 'Authentic Chado Tea Ceremony at Urasenke School',
        category: 'experience',
        estCost: 40,
        description: 'Learn the meditative mindfulness and rituals of preparing ceremonial matcha with a master.'
      },
      {
        name: 'Seasonal Kaiseki Multi-Course Feast in Pontocho',
        category: 'food',
        estCost: 85,
        description: 'Artfully presented seasonal dishes served in an atmospheric riverside wooden machiya.'
      }
    ]
  },
  {
    id: 'dest-swiss-alps',
    name: 'Lauterbrunnen & Zermatt',
    country: 'Switzerland',
    continent: 'Europe',
    tagline: 'Glacial waterfalls, alpine meadows, and the majestic Matterhorn silhouette',
    description: 'Known as the valley of 72 waterfalls, flanked by towering limestone peaks, panoramic cogwheel railways, and world-class alpine hiking trails.',
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'June to September & December to March',
    averageDailyCost: 290,
    currency: 'CHF',
    highlights: ['Gornergrat scenic railway', 'Staubbach Waterfall walk', 'Eiger Trail hike', 'Alpine cheese fondue in Mürren'],
    suggestedActivities: [
      {
        name: 'Gornergrat Railway to 3,135m Matterhorn Viewpoint',
        category: 'transport',
        estCost: 110,
        description: 'Europe\'s highest open-air cogwheel train offering sweeping views of 29 peaks exceeding 4,000 meters.'
      },
      {
        name: 'Trümmelbach Falls Underground Glacial Caverns',
        category: 'sightseeing',
        estCost: 16,
        description: 'Marvel at ten roaring glacial waterfalls carved deep within the mountain rock.'
      },
      {
        name: 'Traditional Swiss Raclette & Fondue Gathering',
        category: 'food',
        estCost: 65,
        description: 'Warm local mountain cheeses melted over baby potatoes, gherkins, and crusty artisanal bread.'
      }
    ]
  },
  {
    id: 'dest-patagonia',
    name: 'Torres del Paine',
    country: 'Chile',
    continent: 'Americas',
    tagline: 'Untamed granite spires, electric-blue glaciers, and vast Patagonian steppe',
    description: 'One of Earth\'s final great wildernesses, where guanacos roam beneath windswept peaks and icebergs calve into crystalline fjords.',
    coverImage: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'November to March',
    averageDailyCost: 195,
    currency: 'USD',
    highlights: ['Base of the Towers sunrise trek', 'Grey Glacier kayak expedition', 'French Valley hanging glaciers', 'Estancia lamb asado'],
    suggestedActivities: [
      {
        name: 'Trek to Mirador Las Torres',
        category: 'experience',
        estCost: 50,
        description: 'Ascend through lenga beech forests and boulder fields to the amphitheater of towering granite monoliths.'
      },
      {
        name: 'Glacier Grey Catamaran & Iceberg Navigation',
        category: 'transport',
        estCost: 120,
        description: 'Sail right up to the colossal 30-meter high sapphire ice walls of the Southern Patagonian Ice Field.'
      }
    ]
  },
  {
    id: 'dest-cape-town',
    name: 'Cape Town & Winelands',
    country: 'South Africa',
    continent: 'Africa',
    tagline: 'Table Mountain grandeur, wild penguin coves, and historic vineyard estates',
    description: 'Where two oceans meet beneath the dramatic silhouette of Table Mountain, surrounded by world-class wine estates in Stellenbosch and Franschhoek.',
    coverImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'October to April',
    averageDailyCost: 140,
    currency: 'ZAR',
    highlights: ['Table Mountain cableway at dusk', 'Boulders Beach penguin colony', 'Franschhoek Wine Tram', 'Chapman’s Peak coastal drive'],
    suggestedActivities: [
      {
        name: 'Sunset Cableway Ascend to Table Mountain',
        category: 'sightseeing',
        estCost: 25,
        description: '360-degree rotating cable car ascending to the world heritage flat-topped summit.'
      },
      {
        name: 'Franschhoek Wine Tram Tasting Journey',
        category: 'food',
        estCost: 75,
        description: 'Hop-on hop-off open-air tram touring century-old Cape Dutch wine estates.'
      }
    ]
  },
  {
    id: 'dest-marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    continent: 'Africa',
    tagline: 'Ochre ramparts, spice-scented souks, and tranquil riad courtyards',
    description: 'A sensory oasis where labyrinthine medina alleys lead to secret tiled riads, vibrant spice pyramids, and the dramatic backdrop of the Atlas Mountains.',
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80',
    bestMonths: 'March to May & September to November',
    averageDailyCost: 110,
    currency: 'MAD',
    highlights: ['Jardin Majorelle & YSL Museum', 'Jemaa el-Fnaa night food stalls', 'Traditional hammam ritual', 'Ben Youssef Madrasa'],
    suggestedActivities: [
      {
        name: 'Private Guided Medina & Souks Craft Tour',
        category: 'experience',
        estCost: 35,
        description: 'Discover master leather crafters, brass lamp makers, and natural dye tanneries with a local historian.'
      },
      {
        name: 'Restorative Traditional Royal Hammam & Argan Oil Ritual',
        category: 'experience',
        estCost: 60,
        description: 'Eucalyptus steam scrub followed by warm floral rosewater and nourishing argan massage.'
      }
    ]
  }
];
