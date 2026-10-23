import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './models/Destination.js';
import TripTheme from './models/TripTheme.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destinations = [
  // ── DOMESTIC ──────────────────────────────────────────
  {
    name: 'Mumbai', country: 'India', region: 'Maharashtra', category: 'City',
    description: 'City of dreams — Bollywood, beaches, and iconic street food.',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600',
    economyPerNight: 2500, standardPerNight: 5000, luxuryPerNight: 12000,
    transportCharge: 2000, activitiesCharge: 1500, rating: 4.3, difficulty: 'Easy',
    highlights: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Juhu Beach'],
    activities: ['Sightseeing', 'Street Food', 'Shopping', 'Nightlife'],
    bestTime: 'November-February',
  },
  {
    name: 'Goa', country: 'India', region: 'Goa', category: 'Beach',
    description: "Sun, sand, and seafood. India's beach capital.",
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
    economyPerNight: 3000, standardPerNight: 6000, luxuryPerNight: 15000,
    transportCharge: 1500, activitiesCharge: 2500, rating: 4.6, difficulty: 'Easy',
    highlights: ['Baga Beach', 'Dudhsagar Falls', 'Fort Aguada', 'Anjuna Market'],
    activities: ['Beach', 'Water Sports', 'Nightlife', 'Heritage Tours'],
    bestTime: 'November-March',
  },
  {
    name: 'Delhi', country: 'India', region: 'Delhi', category: 'Cultural',
    description: "India's capital — history, Mughal monuments, and street food paradise.",
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
    economyPerNight: 2000, standardPerNight: 4500, luxuryPerNight: 10000,
    transportCharge: 1500, activitiesCharge: 1200, rating: 4.2, difficulty: 'Easy',
    highlights: ['Red Fort', 'Qutub Minar', 'India Gate', 'Chandni Chowk'],
    activities: ['Heritage Tours', 'Street Food', 'Shopping', 'Museums'],
    bestTime: 'October-March',
  },
  {
    name: 'Kashmir', country: 'India', region: 'Jammu & Kashmir', category: 'Mountain',
    description: 'Heaven on earth — Dal Lake, shikaras, and snow-capped peaks.',
    image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600',
    economyPerNight: 3500, standardPerNight: 7000, luxuryPerNight: 18000,
    transportCharge: 3000, activitiesCharge: 3000, rating: 4.9, difficulty: 'Moderate',
    highlights: ['Dal Lake', 'Gulmarg', 'Pahalgam', 'Sonamarg'],
    activities: ['Shikara Ride', 'Skiing', 'Trekking', 'Photography'],
    bestTime: 'April-June, December-January',
  },
  {
    name: 'Manali', country: 'India', region: 'Himachal Pradesh', category: 'Adventure',
    description: 'Himalayan adventure hub with rivers, snow, and pine forests.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    economyPerNight: 2500, standardPerNight: 5500, luxuryPerNight: 13000,
    transportCharge: 2500, activitiesCharge: 3500, rating: 4.7, difficulty: 'Moderate',
    highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Beas River'],
    activities: ['Trekking', 'Skiing', 'River Rafting', 'Paragliding'],
    bestTime: 'October-June',
  },
  {
    name: 'Shimla', country: 'India', region: 'Himachal Pradesh', category: 'Mountain',
    description: 'Former British summer capital with colonial charm and mountain views.',
    image: 'https://images.unsplash.com/photo-1597737043023-f43b28f85052?w=600',
    economyPerNight: 2000, standardPerNight: 4500, luxuryPerNight: 10000,
    transportCharge: 2000, activitiesCharge: 1500, rating: 4.4, difficulty: 'Easy',
    highlights: ['The Ridge', 'Mall Road', 'Jakhu Temple', 'Kufri'],
    activities: ['Sightseeing', 'Toy Train', 'Ice Skating', 'Trekking'],
    bestTime: 'March-June, December-January',
  },
  {
    name: 'Jaipur', country: 'India', region: 'Rajasthan', category: 'Cultural',
    description: 'The Pink City — forts, palaces, and Rajputana culture.',
    image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600',
    economyPerNight: 2000, standardPerNight: 4500, luxuryPerNight: 11000,
    transportCharge: 1500, activitiesCharge: 1500, rating: 4.6, difficulty: 'Easy',
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar'],
    activities: ['Heritage Tours', 'Shopping', 'Elephant Ride', 'Cooking Classes'],
    bestTime: 'October-March',
  },
  {
    name: 'Udaipur', country: 'India', region: 'Rajasthan', category: 'Honeymoon',
    description: 'City of Lakes — most romantic destination in India.',
    image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=600',
    economyPerNight: 2500, standardPerNight: 6000, luxuryPerNight: 16000,
    transportCharge: 1500, activitiesCharge: 2000, rating: 4.8, difficulty: 'Easy',
    highlights: ['Lake Pichola', 'City Palace', 'Jag Mandir', 'Saheliyon ki Bari'],
    activities: ['Boat Ride', 'Heritage Walk', 'Cultural Shows', 'Spa'],
    bestTime: 'September-March',
  },
  {
    name: 'Jaisalmer', country: 'India', region: 'Rajasthan', category: 'Adventure',
    description: 'The Golden City — sand dunes, desert safaris, and ancient fort.',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600',
    economyPerNight: 2000, standardPerNight: 4500, luxuryPerNight: 10000,
    transportCharge: 2000, activitiesCharge: 3000, rating: 4.5, difficulty: 'Easy',
    highlights: ['Jaisalmer Fort', 'Sam Sand Dunes', 'Camel Safari', 'Patwon ki Haveli'],
    activities: ['Desert Safari', 'Camel Ride', 'Camping', 'Cultural Shows'],
    bestTime: 'October-March',
  },
  {
    name: 'Kerala', country: 'India', region: 'Kerala', category: 'Beach',
    description: "God's Own Country — backwaters, houseboats, and Ayurveda.",
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600',
    economyPerNight: 2500, standardPerNight: 5500, luxuryPerNight: 13000,
    transportCharge: 1500, activitiesCharge: 2500, rating: 4.7, difficulty: 'Easy',
    highlights: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Kovalam Beach', 'Periyar Wildlife'],
    activities: ['Houseboat Stay', 'Ayurveda', 'Spice Plantation Tour', 'Elephant Safari'],
    bestTime: 'September-March',
  },
  {
    name: 'Bangalore', country: 'India', region: 'Karnataka', category: 'City',
    description: "India's Silicon Valley — gardens, craft beer, and modern culture.",
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600',
    economyPerNight: 2200, standardPerNight: 4800, luxuryPerNight: 11000,
    transportCharge: 1500, activitiesCharge: 1200, rating: 4.3, difficulty: 'Easy',
    highlights: ['Lalbagh Garden', 'Bangalore Palace', 'Cubbon Park', 'Brigade Road'],
    activities: ['City Tour', 'Craft Beer Trail', 'Shopping', 'Nightlife'],
    bestTime: 'October-February',
  },
  {
    name: 'Andaman', country: 'India', region: 'Andaman & Nicobar', category: 'Beach',
    description: 'Crystal waters, coral reefs, and pristine beaches in the Bay of Bengal.',
    image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=600',
    economyPerNight: 3500, standardPerNight: 7000, luxuryPerNight: 18000,
    transportCharge: 4000, activitiesCharge: 4000, rating: 4.8, difficulty: 'Easy',
    highlights: ['Radhanagar Beach', 'Cellular Jail', 'Havelock Island', 'Neil Island'],
    activities: ['Scuba Diving', 'Snorkeling', 'Sea Walking', 'Island Hopping'],
    bestTime: 'October-May',
  },

  // ── INTERNATIONAL ─────────────────────────────────────
  {
    name: 'Bali', country: 'Indonesia', region: 'Bali', category: 'Honeymoon',
    description: 'Island of Gods — temples, rice terraces, and infinite sunsets.',
    image: 'https://images.unsplash.com/photo-1537996266356-c90e9c6ba746?w=600',
    economyPerNight: 4000, standardPerNight: 8000, luxuryPerNight: 20000,
    transportCharge: 5000, activitiesCharge: 3000, rating: 4.9, difficulty: 'Easy',
    highlights: ['Ubud', 'Tanah Lot', 'Kuta Beach', 'Mount Batur'],
    activities: ['Temple Tours', 'Surfing', 'Yoga', 'Rice Terrace Walk'],
    bestTime: 'April-October',
  },
  {
    name: 'Dubai', country: 'UAE', region: 'Dubai', category: 'City',
    description: "City of superlatives — world's tallest, largest, most luxurious.",
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
    economyPerNight: 6000, standardPerNight: 12000, luxuryPerNight: 30000,
    transportCharge: 6000, activitiesCharge: 5000, rating: 4.8, difficulty: 'Easy',
    highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall', 'Desert Safari'],
    activities: ['Desert Safari', 'Skydiving', 'Shopping', 'Dhow Cruise'],
    bestTime: 'November-April',
  },
  {
    name: 'Thailand', country: 'Thailand', region: 'Southeast Asia', category: 'Beach',
    description: "Land of smiles — temples, islands, and legendary street food.",
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600',
    economyPerNight: 3000, standardPerNight: 6500, luxuryPerNight: 16000,
    transportCharge: 4000, activitiesCharge: 2500, rating: 4.7, difficulty: 'Easy',
    highlights: ['Phi Phi Islands', 'Chiang Mai', 'Bangkok Temples', 'Phuket'],
    activities: ['Island Hopping', 'Elephant Sanctuary', 'Thai Boxing', 'Street Food Tour'],
    bestTime: 'November-April',
  },
  {
    name: 'Singapore', country: 'Singapore', region: 'Southeast Asia', category: 'City',
    description: 'Lion City — Gardens by the Bay, Marina Bay, and hawker culture.',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
    economyPerNight: 7000, standardPerNight: 14000, luxuryPerNight: 32000,
    transportCharge: 5000, activitiesCharge: 4000, rating: 4.7, difficulty: 'Easy',
    highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa', 'Chinatown'],
    activities: ['Universal Studios', 'Night Safari', 'Cable Car', 'Hawker Centers'],
    bestTime: 'February-April',
  },
  {
    name: 'Maldives', country: 'Maldives', region: 'Indian Ocean', category: 'Honeymoon',
    description: 'Paradise islands — overwater bungalows and turquoise lagoons.',
    image: 'https://images.unsplash.com/photo-1511491455596-2f7e45f9ab5c?w=600',
    economyPerNight: 8000, standardPerNight: 18000, luxuryPerNight: 45000,
    transportCharge: 8000, activitiesCharge: 5000, rating: 4.9, difficulty: 'Easy',
    highlights: ['Overwater Villas', 'Coral Reefs', 'Whale Shark Diving', 'Bioluminescent Beach'],
    activities: ['Scuba Diving', 'Snorkeling', 'Dolphin Cruise', 'Spa'],
    bestTime: 'November-April',
  },
  {
    name: 'Vietnam', country: 'Vietnam', region: 'Southeast Asia', category: 'Cultural',
    description: 'Halong Bay, ancient towns, and the best street food in Asia.',
    image: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600',
    economyPerNight: 2500, standardPerNight: 5500, luxuryPerNight: 14000,
    transportCharge: 4000, activitiesCharge: 2000, rating: 4.6, difficulty: 'Easy',
    highlights: ['Halong Bay', 'Hoi An', 'Ho Chi Minh City', 'Sapa'],
    activities: ['Cruise', 'Lantern Festival', 'Cooking Class', 'Motorbike Tour'],
    bestTime: 'February-April, August-October',
  },
  {
    name: 'Turkey', country: 'Turkey', region: 'Eurasia', category: 'Cultural',
    description: "Where East meets West — Cappadocia, Bosphorus, and bazaars.",
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600',
    economyPerNight: 4000, standardPerNight: 8500, luxuryPerNight: 20000,
    transportCharge: 5000, activitiesCharge: 3000, rating: 4.7, difficulty: 'Easy',
    highlights: ['Cappadocia', 'Istanbul', 'Pamukkale', 'Ephesus'],
    activities: ['Hot Air Balloon', 'Turkish Bath', 'Bosphorus Cruise', 'Bazaar Shopping'],
    bestTime: 'April-June, September-November',
  },
  {
    name: 'Switzerland', country: 'Switzerland', region: 'Europe', category: 'Honeymoon',
    description: "Alps, chocolate, and watches — Europe's most scenic country.",
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600',
    economyPerNight: 10000, standardPerNight: 20000, luxuryPerNight: 50000,
    transportCharge: 8000, activitiesCharge: 5000, rating: 4.9, difficulty: 'Easy',
    highlights: ['Interlaken', 'Zurich', 'Lucerne', 'Jungfraujoch'],
    activities: ['Skiing', 'Paragliding', 'Lake Cruise', 'Train Journeys'],
    bestTime: 'June-September, December-February',
  },
  {
    name: 'Paris', country: 'France', region: 'Europe', category: 'Honeymoon',
    description: "City of Love — Eiffel Tower, Seine, and world-class cuisine.",
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    economyPerNight: 8000, standardPerNight: 16000, luxuryPerNight: 40000,
    transportCharge: 7000, activitiesCharge: 4000, rating: 4.9, difficulty: 'Easy',
    highlights: ['Eiffel Tower', 'Louvre', 'Notre-Dame', 'Montmartre'],
    activities: ['Sightseeing', 'Museums', 'Dining', 'Shopping'],
    bestTime: 'April-June, September-October',
  },
];

const seedDestinations = async () => {
  try {
    await Destination.deleteMany({});
    await Destination.insertMany(destinations);
    console.log(`✅ ${destinations.length} destinations seeded`);

    // Re-seed trip themes linked to new destinations
    const created = await Destination.find();
    const byCategory = (cat) => created.filter(d => d.category === cat).map(d => d._id);

    await TripTheme.deleteMany({});
    await TripTheme.insertMany([
      { name: 'Honeymoon', description: 'Romantic getaways for couples', features: ['Romantic venues', 'Luxury resorts', 'Beach access', 'Sunset views'], avgDuration: 7, avgBudget: 80000, suggestedDestinations: byCategory('Honeymoon') },
      { name: 'Adventure', description: 'Thrilling mountain & outdoor trips', features: ['Trekking', 'Rafting', 'Snow activities', 'Camping'], avgDuration: 6, avgBudget: 30000, suggestedDestinations: byCategory('Adventure') },
      { name: 'Beach',     description: 'Relax by sun & sea', features: ['Beach access', 'Water sports', 'Snorkeling', 'Resorts'], avgDuration: 5, avgBudget: 35000, suggestedDestinations: byCategory('Beach') },
      { name: 'Cultural',  description: 'History, art & heritage', features: ['Monuments', 'Museums', 'Local culture', 'Food tours'], avgDuration: 6, avgBudget: 25000, suggestedDestinations: byCategory('Cultural') },
      { name: 'Luxury',    description: 'Premium 5-star experiences', features: ['5-star hotels', 'Fine dining', 'Spa', 'VIP treatment'], avgDuration: 5, avgBudget: 120000, suggestedDestinations: byCategory('City') },
      { name: 'Family',    description: 'Fun for the whole family', features: ['Theme parks', 'Safe activities', 'Child-friendly', 'Entertainment'], avgDuration: 5, avgBudget: 40000, suggestedDestinations: byCategory('Mountain') },
    ]);
    console.log('✅ Trip themes seeded');

    mongoose.connection.close();
    console.log('\n✨ seedDestinations complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

connectDB().then(seedDestinations);