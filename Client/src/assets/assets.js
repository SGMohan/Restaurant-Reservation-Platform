// ==============================
// IMAGE ASSETS IMPORTS
// ==============================

// Logo and Brand Assets
import logo from "./logo.svg";
import logoBlack from "./logoBlack.svg";

// Authentication Icons
import personIcon from "./person_icon.svg";
import mailIcon from "./mail_icon.svg";
import lockIcon from "./lock_icon.svg";
import logoutIcon from "./logout.png";

// Navigation and Action Icons
import bookIcon from "./book.png";
import searchIcon from "./searchIcon.svg";
import closeIcon from "./closeIcon.svg";
import addIcon from "./addIcon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import listIcon from "./listIcon.svg";
import uploadArea from "./uploadArea.svg";

// Restaurant Feature Icons
import calenderIcon from "./calenderIcon.svg";
import cuisineIcon from "./cuisineIcon.svg";
import foodIcon from "./foodIcon.svg";
import ambienceIcon from "./ambienceIcon.svg";
import ingredientsIcon from "./ingredientsIcon.svg";
import priceIcon from "./priceIcon.svg";
import locationIcon from "./locationIcon.svg";
import locationFind from "./locationFind.svg";
import locationFilledIcon from "./locationFilledIcon.svg";
import starIconFilled from "./starIconFilled.svg";
import arrowIcon from "./arrowIcon.svg";
import badgeIcon from "./badgeIcon.svg";
import menuIcon from "./menuIcon.svg";

// Restaurant Amenity Icons
import bulterServiceIcon from "./bulterServiceIcon.svg";
import privatePartyIcon from "./privatePartyIcon.svg";
import liveMusicIcon from "./liveMusicIcon.svg";
import liveCookingIcon from "./liveCookingIcon.svg";
import outdoorSeatingIcon from "./outdoorSeatingIcon.svg";
import groupIcon from "./groupIcon.svg";
import fineDiningIcon from "./fineDiningIcon.svg";
import veganIcon from "./veganIcon.svg";
import birthdayIcon from "./birthdayIcon.svg";
import cocktailIcon from "./cocktailIcon.svg";
import sunsetViewIcon from "./sunsetViewIcon.svg";
import loungeIcon from "./loungeIcon.svg";
import liveCounterIcon from "./liveCounterIcon.svg";

// Social Media Icons
import instagramIcon from "./instagramIcon.svg";
import facebookIcon from "./facebookIcon.svg";
import twitterIcon from "./twitterIcon.svg";
import linkendinIcon from "./linkendinIcon.svg";

// Registration and Dining Images
import regImage from "./regImage.jpg";

// Dining Area Images (1-32)
import dineImage1 from "./dineImage1.png";
import dineImage2 from "./dineImage2.png";
import dineImage3 from "./dineImage3.png";
import dineImage4 from "./dineImage4.png";
import dineImage5 from "./dineImage5.png";
import dineImage6 from "./dineImage6.png";
import dineImage7 from "./dineImage7.png";
import dineImage8 from "./dineImage8.png";
import dineImage9 from "./dineImage9.png";
import dineImage10 from "./dineImage10.png";
import dineImage11 from "./dineImage11.png";
import dineImage12 from "./dineImage12.png";
import dineImage13 from "./dineImage13.png";
import dineImage14 from "./dineImage14.png";
import dineImage15 from "./dineImage15.png";
import dineImage16 from "./dineImage16.png";
import dineImage17 from "./dineImage17.png";
import dineImage18 from "./dineImage18.png";
import dineImage19 from "./dineImage19.png";
import dineImage20 from "./dineImage20.png";
import dineImage21 from "./dineImage21.png";
import dineImage22 from "./dineImage22.png";
import dineImage23 from "./dineImage23.png";
import dineImage24 from "./dineImage24.png";
import dineImage25 from "./dineImage25.png";
import dineImage26 from "./dineImage26.png";
import dineImage27 from "./dineImage27.png";
import dineImage28 from "./dineImage28.png";
import dineImage29 from "./dineImage29.png";
import dineImage30 from "./dineImage30.png";
import dineImage31 from "./dineImage31.png";
import dineImage32 from "./dineImage32.png";

// Exclusive Offer Images
import exclusiveOfferCardImg1 from "./exclusiveOfferCardImg1.png";
import exclusiveOfferCardImg2 from "./exclusiveOfferCardImg2.png";
import exclusiveOfferCardImg3 from "./exclusiveOfferCardImg3.png";

// ==============================
// ASSETS EXPORT OBJECT
// ==============================

/**
 * Collection of all image assets used throughout the application
 */
export const assets = {
  // Brand and Logo
  logo,
  logoBlack,

  // Authentication
  personIcon,
  mailIcon,
  lockIcon,
  logoutIcon,

  // Navigation and Actions
  bookIcon,
  searchIcon,
  closeIcon,
  addIcon,
  dashboardIcon,
  listIcon,
  uploadArea,

  // Restaurant Features
  calenderIcon,
  cuisineIcon,
  foodIcon,
  ambienceIcon,
  ingredientsIcon,
  priceIcon,
  locationIcon,
  locationFind,
  locationFilledIcon,
  starIconFilled,
  arrowIcon,
  badgeIcon,
  menuIcon,

  // Restaurant Amenities
  bulterServiceIcon,
  privatePartyIcon,
  liveMusicIcon,
  liveCookingIcon,
  outdoorSeatingIcon,
  groupIcon,
  fineDiningIcon,
  veganIcon,
  birthdayIcon,
  cocktailIcon,
  sunsetViewIcon,
  loungeIcon,
  liveCounterIcon,

  // Social Media
  instagramIcon,
  facebookIcon,
  twitterIcon,
  linkendinIcon,

  // Images
  regImage,

  // Dining Area Images
  dineImage1,
  dineImage2,
  dineImage3,
  dineImage4,
  dineImage5,
  dineImage6,
  dineImage7,
  dineImage8,
  dineImage9,
  dineImage10,
  dineImage11,
  dineImage12,
  dineImage13,
  dineImage14,
  dineImage15,
  dineImage16,
  dineImage17,
  dineImage18,
  dineImage19,
  dineImage20,
  dineImage21,
  dineImage22,
  dineImage23,
  dineImage24,
  dineImage25,
  dineImage26,
  dineImage27,
  dineImage28,
  dineImage29,
  dineImage30,
  dineImage31,
  dineImage32,

  // Exclusive Offers
  exclusiveOfferCardImg1,
  exclusiveOfferCardImg2,
  exclusiveOfferCardImg3,
};

// ==============================
// APPLICATION DATA
// ==============================

/**
 * List of top cities with popular restaurants
 */
export const cities = ["Chennai", "Bangalore", "Hyderabad", "Mumbai"];

/**
 * Exclusive restaurant offers data
 */
export const exclusiveOffers = [
  {
    _id: 1,
    title: "Weekend Dinner Combo",
    description: "Flat 25% off on dinner reservations this weekend",
    priceOff: 25,
    expiryDate: "July 20",
    image: exclusiveOfferCardImg1,
  },
  {
    _id: 2,
    title: "Romantic Rooftop Dining",
    description: "Book a table for two and get complimentary desserts",
    priceOff: 20,
    expiryDate: "July 25",
    image: exclusiveOfferCardImg2,
  },
  {
    _id: 3,
    title: "Early Bird Breakfast",
    description: "Reserve before 9AM and get 30% off on breakfast menu",
    priceOff: 30,
    expiryDate: "Aug 1",
    image: exclusiveOfferCardImg3,
  },
];

/**
 * Customer testimonials and reviews
 */
export const testimonials = [
  {
    _id: 1,
    name: "Arjun Mehta",
    address: "Chennai, India",
    image:
      "https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTd8fG1hbGUlMjBjYXJ0b29ufGVufDB8fDB8fHww",
    rating: 4,
    review:
      "Had a great experience booking a table at The Spice Villa. Smooth process and delicious food. Will book again!",
  },
  {
    _id: 2,
    name: "Sneha Reddy",
    address: "Hyderabad, India",
    image:
      "https://plus.unsplash.com/premium_photo-1740011638701-560cc9c1b833?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZlbWFsZSUyMGNhcnRvb258ZW58MHx8MHx8fDA%3D",
    rating: 4,
    review:
      "Love the UI and easy reservation flow. Got a rooftop table and the food was amazing. Would love to see more restaurants!",
  },
  {
    _id: 3,
    name: "Karan Desai",
    address: "Mumbai, India",
    image:
      "https://plus.unsplash.com/premium_photo-1739786995646-480d5cfd83dc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fG1hbGUlMjBjYXJ0b29ufGVufDB8fDB8fHww",
    rating: 4.5,
    review:
      "Booked a table for my family dinner. The app even showed us the chef specials! Loved the review section too.",
  },
];

/**
 * Mapping of restaurant features to their corresponding icons
 */
export const featuresIcon = {
  "Fine Dining": assets.fineDiningIcon,
  "Private Parties": assets.privatePartyIcon,
  "Bar Service": assets.bulterServiceIcon,
  "Live Music": assets.liveMusicIcon,
  "Outdoor Seating": assets.outdoorSeatingIcon,
  "Live Cooking": assets.liveCookingIcon,
  "Family Friendly": assets.groupIcon,
  "Signature Cocktails": assets.cocktailIcon,
  "Sunset Views": assets.sunsetViewIcon,
  "Lounge Seating": assets.loungeIcon,
  "Live Counters": assets.liveCounterIcon,
  "Birthday Celebrations": assets.birthdayIcon,
};

/**
 * Common dining specifications data
 */
export const diningCommonData = [
  {
    icon: assets.foodIcon,
    title: "Delicious Cuisine",
    description: "Experience authentic flavors prepared by expert chefs.",
  },
  {
    icon: assets.locationFilledIcon,
    title: "Prime Location",
    description: "90% of guests rated our location as excellent.",
  },
  {
    icon: assets.ambienceIcon,
    title: "Great Ambience",
    description: "Enjoy a perfect dining atmosphere for any occasion.",
  },
  {
    icon: assets.ingredientsIcon,
    title: "Fresh Ingredients",
    description: "We use only the freshest, locally-sourced ingredients.",
  },
];

// ==============================
// DUMMY DATA FOR DEVELOPMENT
// ==============================

/**
 * Sample user data for development and testing
 */
export const userDummyData = [
  {
    _id: "1",
    name: "Food Explorer",
    email: "user.foodexplorer@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-03-25T09:29:16.367Z",
    updatedAt: "2025-04-10T06:34:48.719Z",
    __v: 1,
  },
  {
    _id: "2",
    name: "Italian Lover",
    email: "italian.lover@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-02-15T08:20:10.123Z",
    updatedAt: "2025-03-22T11:45:30.456Z",
    __v: 1,
  },
  {
    _id: "3",
    name: "Sushi Master",
    email: "sushi.master@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-01-10T14:15:22.789Z",
    updatedAt: "2025-02-28T09:30:45.678Z",
    __v: 1,
  },
  {
    _id: "4",
    name: "Taco King",
    email: "taco.king@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-04-05T10:45:33.111Z",
    updatedAt: "2025-05-12T16:20:55.222Z",
    __v: 1,
  },
  {
    _id: "5",
    name: "Luxury Diner",
    email: "luxury.diner@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-03-15T12:30:44.333Z",
    updatedAt: "2025-04-20T14:10:66.444Z",
    __v: 1,
  },
  {
    _id: "6",
    name: "Family Chef",
    email: "family.chef@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-02-20T09:15:55.555Z",
    updatedAt: "2025-03-30T10:25:77.666Z",
    __v: 1,
  },
  {
    _id: "7",
    name: "Thai Specialist",
    email: "thai.specialist@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-01-25T11:40:66.777Z",
    updatedAt: "2025-02-15T13:35:88.888Z",
    __v: 1,
  },
  {
    _id: "8",
    name: "Skyline View",
    email: "skyline.view@gmail.com",
    role: "restaurantOwner",
    createdAt: "2025-04-10T15:50:77.999Z",
    updatedAt: "2025-05-15T17:45:99.000Z",
    __v: 1,
  },
];

/**
 * Sample restaurant data for development and testing
 */
export const restaurantDummyData = [
  {
    _id: "1",
    name: "Garden Pavilion",
    address: "12, Marina Beach Road, Chennai",
    city: "Chennai",
    contact: "+914412345678",
    openingHours: "12:00 AM - 10:00 PM",
    owner: userDummyData[0],
  },
  {
    _id: "2",
    name: "Tuscany Hall",
    address: "45, Brigade Road, Bangalore",
    city: "Bangalore",
    contact: "+918012345678",
    owner: userDummyData[1],
  },
  {
    _id: "3",
    name: "Teppanyaki Counter",
    address: "78, Jubilee Hills, Hyderabad",
    city: "Hyderabad",
    contact: "+914012345678",
    owner: userDummyData[2],
  },
  {
    _id: "4",
    name: "Cantina Patio",
    address: "23, Colaba Causeway, Mumbai",
    city: "Mumbai",
    contact: "+912212345678",
    owner: userDummyData[3],
  },
  {
    _id: "5",
    name: "The Velvet Room",
    address: "56, Mount Road, Chennai",
    city: "Chennai",
    contact: "+914412345679",
    owner: userDummyData[4],
  },
  {
    _id: "6",
    name: "Panda Hall",
    address: "34, Koramangala, Bangalore",
    city: "Bangalore",
    contact: "+918012345679",
    owner: userDummyData[5],
  },
  {
    _id: "7",
    name: "Thali Hall",
    address: "89, Hitech City, Hyderabad",
    city: "Hyderabad",
    contact: "+914012345679",
    owner: userDummyData[6],
  },
  {
    _id: "8",
    name: "Floating Lounge",
    address: "67, Bandra West, Mumbai",
    city: "Mumbai",
    contact: "+912212345679",
    owner: userDummyData[7],
  },
];

/**
 * Sample dining areas data for development and testing
 */
export const diningAreas = [
  {
    _id: "1",
    restaurant: "1",
    cuisineType: "Indian",
    guests: 40,
    images: [dineImage1, dineImage2, dineImage3, dineImage4],
    type: "Indoor",
    rating: 4,
    reviewCount: 128,
    features: ["Live Music", "Outdoor Seating"],
    dietaryOptions: ["Vegetarian", "Vegan"],
    ambiance: ["Romantic", "Casual"],
    isAvailable: true,
    createdAt: "2025-04-10T06:26:04.013Z",
    updatedAt: "2025-04-10T06:26:04.013Z",
    priceRange: 199,
    restaurantRating: 4.5,
  },
  {
    _id: "2",
    restaurant: "2",
    guests: 30,
    cuisineType: "Italian",
    description:
      "Elegant outdoor dining with candlelit tables and wine cellar view",
    images: [dineImage5, dineImage6, dineImage7, dineImage8],
    type: "Outdoor",
    features: ["Fine Dining", "Private Parties"],
    rating: 5,
    reviewCount: 95,
    dietaryOptions: ["Gluten-Free"],
    ambiance: ["Romantic", "Upscale"],
    isAvailable: true,
    createdAt: "2025-04-10T06:25:22.593Z",
    updatedAt: "2025-04-10T06:25:22.593Z",
    openingHours: "12:00 PM - 10:30 PM",
    website: "www.tuscanyhall.com",
    priceRange: 299,
    restaurantRating: 4.2,
  },
  {
    _id: "3",
    restaurant: "3",
    guests: 20,
    cuisineType: "Japanese",
    description: "Interactive chef's table with premium Japanese ingredients",
    images: [dineImage9, dineImage10, dineImage11, dineImage12],
    type: "Chef's Table",
    features: ["Live Cooking", "Family Friendly"],
    rating: 4.8,
    reviewCount: 64,
    dietaryOptions: ["Vegetarian", "Vegan", "Halal"],
    ambiance: ["Casual", "Family-Friendly"],
    isAvailable: true,
    createdAt: "2025-04-10T06:24:06.285Z",
    updatedAt: "2025-04-10T06:24:06.285Z",
    openingHours: "6:00 PM - 11:30 PM",
    website: "www.teppanyakicounter.com",
    priceRange: 199,
    restaurantRating: 4.7,
  },
  {
    _id: "4",
    restaurant: "4",
    guests: 50,
    cuisineType: "Mexican",
    description:
      "Vibrant Mexican courtyard with colorful tiles and hanging plants",
    images: [dineImage13, dineImage14, dineImage15, dineImage16],
    type: "Outdoor",
    features: ["Bar Service", "Live Music"],
    rating: 4,
    reviewCount: 112,
    dietaryOptions: ["Vegetarian"],
    ambiance: ["Casual"],
    isAvailable: true,
    createdAt: "2025-04-10T06:23:20.252Z",
    updatedAt: "2025-04-10T06:23:20.252Z",
    openingHours: "11:30 AM - 12:00 AM",
    website: "www.cantinapatio.com",
    priceRange: 399,
    restaurantRating: 4.3,
  },
  {
    _id: "5",
    restaurant: "5",
    guests: 25,
    cuisineType: "Western",
    description:
      "Luxurious private dining with crystal chandeliers and butler service",
    images: [dineImage17, dineImage18, dineImage19, dineImage20],
    type: "Private Dining",
    features: ["Bar Service", "Live Music"],
    rating: 3,
    reviewCount: 48,
    dietaryOptions: ["Gluten-Free", "Kosher"],
    ambiance: ["Upscale", "Business"],
    isAvailable: true,
    createdAt: "2025-04-10T06:22:10.111Z",
    updatedAt: "2025-04-10T06:22:10.111Z",
    openingHours: "7:00 PM - 12:30 AM",
    website: "www.velvetroom.com",
    priceRange: 999,
    restaurantRating: 4.8,
  },
  {
    _id: "6",
    restaurant: "6",
    guests: 56,
    cuisineType: "Indian",
    description: "Family-style dining with round tables and lazy susans",
    images: [dineImage21, dineImage22, dineImage23, dineImage24],
    type: "Family Dining",
    features: ["Family Friendly", "Private Parties"],
    rating: 4,
    reviewCount: 156,
    dietaryOptions: ["Vegetarian"],
    ambiance: ["Family-Friendly", "Casual"],
    isAvailable: true,
    createdAt: "2025-04-10T06:21:05.987Z",
    updatedAt: "2025-04-10T06:21:05.987Z",
    openingHours: "10:00 AM - 10:00 PM",
    website: "www.pandahall.com",
    priceRange: 499,
    restaurantRating: 4.1,
  },
  {
    _id: "7",
    restaurant: "7",
    guests: 55,
    cuisineType: "Thai",
    description: "Traditional floor seating with brass thali service",
    images: [dineImage25, dineImage26, dineImage27, dineImage28],
    type: "Traditional",
    features: ["Fine Dining", "Birthday Parties"],
    rating: 5,
    reviewCount: 203,
    dietaryOptions: ["Vegetarian", "Vegan"],
    ambiance: ["Family-Friendly", "Casual"],
    isAvailable: true,
    createdAt: "2025-04-10T06:20:15.876Z",
    updatedAt: "2025-04-10T06:20:15.876Z",
    openingHours: "12:00 PM - 11:00 PM",
    website: "www.thalihall.com",
    priceRange: 399,
    restaurantRating: 4.6,
  },
  {
    _id: "8",
    restaurant: "8",
    guests: 45,
    cuisineType: "Indian",
    description: "Overwater dining with views of the city skyline",
    images: [dineImage29, dineImage30, dineImage31, dineImage32],
    type: "Rooftop",
    features: ["Sunset Views", "Lounge Seating"],
    rating: 4,
    reviewCount: 87,
    dietaryOptions: ["Gluten-Free"],
    ambiance: ["Romantic", "Upscale"],
    isAvailable: true,
    createdAt: "2025-04-10T06:19:10.765Z",
    updatedAt: "2025-04-10T06:19:10.765Z",
    openingHours: "5:00 PM - 1:00 AM",
    website: "www.floatinglounge.com",
    priceRange: 999,
    restaurantRating: 4.4,
  },
];

/**
 * Sample reviews data for development and testing
 */
export const dummyReviews = [
  {
    _id: "1",
    user: "Alex Johnson",
    restaurant: {
      _id: "1",
      name: "Garden Pavilion",
      cuisine: "French",
      location: "Chennai",
    },
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    date: "2025-08-20",
    comment:
      "Amazing food and excellent service! The ambiance was perfect for our anniversary dinner. We'll definitely be coming back.",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    ],
    isOwner: false,
    ownerReply:
      "Thank you for your kind words, Alex! We're thrilled you enjoyed your anniversary with us.",
    helpfulCount: 12,
    tags: ["Anniversary", "Fine Dining", "Romantic"],
    visitedDate: "2025-08-21",
    dishesTried: ["Filet Mignon", "Chocolate Soufflé"],
  },
  {
    _id: "2",
    user: "Sarah Miller",
    restaurant: {
      _id: "2",
      name: "Tuscany Hall",
      cuisine: "Italian",
      location: "Bangalore",
    },
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    date: "2025-04-28",
    comment:
      "Great experience overall. The pasta was delicious, though a bit pricey. Service was attentive without being intrusive.",
    photos: [],
    isOwner: false,
    ownerReply: "",
    helpfulCount: 5,
    tags: ["Italian", "Date Night"],
    visitedDate: "2025-04-27",
    dishesTried: ["Truffle Pasta", "Tiramisu"],
  },
  {
    _id: "3",
    user: "Michael Chen",
    restaurant: {
      _id: "3",
      name: "Teppanyaki Counter",
      cuisine: "Japanese",
      location: "Hyderabad",
    },
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 3,
    date: "2025-04-10",
    comment:
      "Decent food but the wait time was too long. Maybe understaffed that night?",
    photos: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5"],
    isOwner: false,
    ownerReply:
      "We apologize for the wait time, Michael. We've since hired additional staff for busy nights.",
    helpfulCount: 8,
    tags: ["Wait Time", "Weekend Crowd"],
    visitedDate: "2025-04-08",
    dishesTried: ["Burger", "Craft Beer"],
  },
  {
    _id: "4",
    user: "Emily Rodriguez",
    restaurant: {
      _id: "4",
      name: "Cantina Patio",
      cuisine: "Mexican",
      location: "Mumbai",
    },
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 5,
    date: "2025-06-02",
    comment:
      "Absolutely phenomenal! The chef's tasting menu was worth every penny. Wine pairing recommendations were spot on.",
    photos: [
      "https://images.unsplash.com/photo-1555244162-803834f70033",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    ],
    isOwner: false,
    ownerReply:
      "So glad you enjoyed the tasting experience, Emily! Our sommelier will be delighted to hear this.",
    helpfulCount: 15,
    tags: ["Tasting Menu", "Wine Pairing", "Special Occasion"],
    visitedDate: "2025-06-01",
    dishesTried: ["Chef's Tasting Menu", "Chardonnay Pairing"],
  },
  {
    _id: "5",
    user: "David Kim",
    restaurant: {
      _id: "5",
      name: "The Velvet Room",
      cuisine: "Continental",
      location: "Chennai",
    },
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 4,
    date: "2025-05-20",
    comment:
      "Excellent brunch spot! Bottomless mimosas were a hit with our group. Only suggestion would be more vegetarian options.",
    photos: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c"],
    isOwner: false,
    ownerReply:
      "Thanks for the feedback, David! We're actually expanding our vegetarian menu next month.",
    helpfulCount: 7,
    tags: ["Brunch", "Group Dining", "Bottomless Drinks"],
    visitedDate: "2025-05-19",
    dishesTried: ["Avocado Toast", "Bottomless Mimosas"],
  },
  {
    _id: "6",
    user: "Priya Patel",
    restaurant: {
      _id: "6",
      name: "Panda Hall",
      cuisine: "Chinese",
      location: "Bangalore",
    },
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    rating: 2,
    date: "2025-03-15",
    comment:
      "Disappointed with the service. Our food arrived cold and the server seemed overwhelmed.",
    photos: [],
    isOwner: false,
    ownerReply:
      "We're truly sorry about your experience, Priya. Please reach out to us directly so we can make it right.",
    helpfulCount: 3,
    tags: ["Service Issues", "Cold Food"],
    visitedDate: "2025-03-14",
    dishesTried: ["Butter Chicken", "Garlic Naan"],
  },
  {
    _id: "7",
    user: "James Wilson",
    restaurant: {
      _id: "7",
      name: "Thali Hall",
      cuisine: "Indian",
      location: "Hyderabad",
    },
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    rating: 5,
    date: "2025-06-10",
    comment:
      "Best steak I've had in years! Perfectly cooked to medium-rare just as I requested. The truffle mac and cheese side was heavenly.",
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947",
      "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
    ],
    isOwner: false,
    ownerReply:
      "Our butcher will be thrilled to hear this, James! We take great pride in our steak program.",
    helpfulCount: 18,
    tags: ["Steakhouse", "Perfect Cook"],
    visitedDate: "2025-06-09",
    dishesTried: ["Ribeye", "Truffle Mac & Cheese"],
  },
  {
    _id: "8",
    user: "Lisa Ray",
    restaurant: {
      _id: "8",
      name: "Floating Lounge",
      cuisine: "Fusion",
      location: "Mumbai",
    },
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    rating: 4,
    date: "2025-06-18",
    comment:
      "Incredible views and creative cocktails. The small plates were perfect for sharing with friends.",
    photos: ["https://images.unsplash.com/photo-1555244162-803834f70033"],
    isOwner: false,
    ownerReply:
      "Thank you Lisa! We're proud of our mixology program and happy you enjoyed the experience.",
    helpfulCount: 9,
    tags: ["Cocktails", "View", "Small Plates"],
    visitedDate: "2025-06-17",
    dishesTried: ["Tuna Tartare", "Signature Martini"],
  },
];

/**
 * Sample user reservation data for development and testing
 */
export const userReservationsDummyData = [
  {
    _id: "67f76839994a731e97d3b8ce",
    user: userDummyData[0],
    diningArea: diningAreas[1], // Tuscany Hall
    restaurant: restaurantDummyData[1],
    reservationDateTime: "2025-04-30T19:00:00.000Z",
    guests: 4,
    totalPrice: 1196, // 299 x 4
    status: "Confirmed",
    paymentMethod: "Stripe",
    isPaid: true,
    specialRequests: "Anniversary celebration",
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
  {
    _id: "67f76829994a731e97d3b8c3",
    user: userDummyData[2],
    diningArea: diningAreas[2], // Teppanyaki Counter
    restaurant: restaurantDummyData[2],
    reservationDateTime: "2025-04-27T20:30:00.000Z",
    guests: 2,
    totalPrice: 1194, // 199 x 6
    status: "Pending",
    paymentMethod: "Pay At Restaurant",
    isPaid: false,
    specialRequests: "Vegetarian options only",
    createdAt: "2025-04-10T06:41:45.873Z",
    updatedAt: "2025-04-10T06:41:45.873Z",
    __v: 0,
  },
  {
    _id: "67f76810994a731e97d3b8b4",
    user: userDummyData[4],
    diningArea: diningAreas[4], // The Velvet Room
    restaurant: restaurantDummyData[4],
    reservationDateTime: "2025-04-11T21:00:00.000Z",
    guests: 6,
    totalPrice: 5994, // 999 x 6
    status: "Confirmed",
    paymentMethod: "Stripe",
    isPaid: true,
    specialRequests: "Business dinner - private table",
    createdAt: "2025-04-10T06:41:20.501Z",
    updatedAt: "2025-04-10T06:41:20.501Z",
    __v: 0,
  },
  {
    _id: "67f76810994a731e97d3b8b5",
    user: userDummyData[3],
    diningArea: diningAreas[3], // Cantina Patio
    restaurant: restaurantDummyData[3],
    reservationDateTime: "2025-05-15T20:00:00.000Z",
    guests: 8,
    totalPrice: 3192, // 399 x 8
    status: "Cancelled",
    paymentMethod: "Refunded",
    isPaid: false,
    specialRequests: "Birthday celebration",
    createdAt: "2025-04-15T08:30:00.000Z",
    updatedAt: "2025-05-01T10:15:00.000Z",
    __v: 0,
  },
];

/**
 * Sample restaurant dashboard data for development and testing
 */
export const restaurantDashboardDummyData = {
  totalReservations: 4,
  totalRevenue: 15576, // Sum of all paid reservations
  upcomingReservations: 2,
  cancellationRate: 50, // 1 out of 4 cancelled
  averageGuests: 499, // (4+2+6+8)/4
  popularDiningAreas: [
    diningAreas[5],
    diningAreas[0],
    diningAreas[2],
    diningAreas[3],
  ],
  reservations: userReservationsDummyData,
  recentReviews: [
    dummyReviews[0], // Alex Johnson's review
    dummyReviews[3], // Emily Rodriguez's review
    dummyReviews[6], // James Wilson's review
  ],
};
