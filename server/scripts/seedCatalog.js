const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

dotenv.config();

const categoryData = [
  {
    name: 'Veg Pickles',
    slug: 'veg-pickles',
    type: 'veg',
    description: 'Traditional vegetarian pickles made with regional spices.'
  },
  {
    name: 'Non Veg Pickles',
    slug: 'non-veg-pickles',
    type: 'non-veg',
    description: 'Rich and spicy meat pickle varieties.'
  },
  {
    name: 'Seafood Pickles',
    slug: 'seafood-pickles',
    type: 'seafood',
    description: 'Fresh seafood pickles with coastal flavors.'
  },
  {
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    type: 'dry-fruits',
    description: 'Premium dry fruit mixes and sweet dry fruit specials.'
  }
];

const vegVarieties = [
  'Avakaya Mango Pickle',
  'Gongura Pickle',
  'Tomato Pickle',
  'Lemon Pickle',
  'Amla Pickle',
  'Garlic Pickle',
  'Green Chilli Pickle',
  'Tamarind Pickle',
  'Curry Leaf Pickle',
  'Dosakaya Pickle',
  'Red Chilli Pickle',
  'Mango Ginger Pickle',
  'Onion Pickle',
  'Mixed Vegetable Pickle',
  'Drumstick Pickle',
  'Beetroot Pickle',
  'Carrot Pickle',
  'Ridge Gourd Pickle',
  'Raw Banana Pickle',
  'Brinjal Pickle'
];

const nonVegVarieties = [
  'Chicken Boneless Pickle',
  'Chicken With Bone Pickle',
  'Mutton Pickle',
  'Keema Pickle',
  'Prawn Chicken Mix Pickle',
  'Country Chicken Pickle',
  'Spicy Chicken Pickle',
  'Pepper Chicken Pickle',
  'Smoked Chicken Pickle',
  'Mutton Garlic Pickle',
  'Mutton Pepper Pickle',
  'Dry Chicken Pickle',
  'Andhra Chicken Pickle',
  'Ghee Roast Chicken Pickle',
  'Hyderabadi Mutton Pickle',
  'Ginger Chicken Pickle',
  'Boneless Mutton Dry Pickle',
  'Country Mutton Pickle',
  'Green Chilli Chicken Pickle',
  'Spicy Keema Pickle'
];

const seafoodVarieties = [
  'Prawn Pickle',
  'Fish Pickle',
  'Crab Pickle',
  'Anchovy Pickle',
  'Boneless Fish Pickle',
  'Dry Fish Pickle',
  'Tuna Pickle',
  'Surmai Pickle',
  'Squid Pickle',
  'Octopus Pickle',
  'Baby Shrimp Pickle'
];

const dryFruitVarieties = [
  'Classic Dry Fruit Mix',
  'Royal Dry Fruit Mix',
  'Dates Delight Mix',
  'Cashew Raisin Mix',
  'Pista Almond Mix',
  'Dry Fruit Laddu Mix',
  'Honey Dry Fruit Blend',
  'Kesar Dry Fruit Blend',
  'Premium Dry Fruit Box',
  'Dry Fruit Energy Mix',
  'Anjeer Walnut Mix',
  'Roasted Dry Fruit Mix',
  'Dry Fruit Sweet Bites',
  'Festival Dry Fruit Assortment',
  'Dry Fruit Halwa Mix'
];

const buildVariants = (basePrice) => [
  { packSize: '250g', price: basePrice, stock: 80 },
  { packSize: '500g', price: Math.round(basePrice * 1.85), stock: 60 },
  { packSize: '1kg', price: Math.round(basePrice * 3.5), stock: 40 }
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const createProductsForCategory = (names, category, basePriceStart) =>
  names.map((name, index) => ({
    name,
    slug: slugify(`${category.slug}-${name}`),
    description: `${name} from our ${category.name} section, prepared with authentic spices, premium oil blend, and home-style recipe for long-lasting taste.`,
    price: basePriceStart + index * 10,
    images: [
      {
        public_id: `${slugify(name)}-img`,
        url: `https://dummyimage.com/900x600/f59e0b/ffffff&text=${encodeURIComponent(name)}`
      }
    ],
    category: category._id,
    stock: 120,
    discountPercentage: 8 + (index % 5) * 3,
    variants: buildVariants(basePriceStart + index * 10),
    tags: [category.slug, 'pickle', 'andhra']
  }));

const seed = async () => {
  try {
    await connectDB();
    const shouldReset = String(process.env.RESET_CATALOG || '').toLowerCase() === 'true';
    if (shouldReset) {
      await Product.deleteMany({});
      await Category.deleteMany({});
    }

    await Category.bulkWrite(
      categoryData.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $set: category },
          upsert: true
        }
      }))
    );

    const categories = await Category.find({ slug: { $in: categoryData.map((c) => c.slug) } });
    const bySlug = categories.reduce((acc, item) => ({ ...acc, [item.slug]: item }), {});

    const products = [
      ...createProductsForCategory(vegVarieties, bySlug['veg-pickles'], 120),
      ...createProductsForCategory(nonVegVarieties, bySlug['non-veg-pickles'], 210),
      ...createProductsForCategory(seafoodVarieties, bySlug['seafood-pickles'], 230),
      ...createProductsForCategory(dryFruitVarieties, bySlug['dry-fruits'], 190)
    ];

    const productWriteResult = await Product.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { slug: product.slug },
          // Preserve existing docs (including custom images) unless RESET_CATALOG=true
          update: shouldReset ? { $set: product } : { $setOnInsert: product },
          upsert: true
        }
      }))
    );

    const createdProducts = productWriteResult.upsertedCount || 0;
    console.log(
      `Catalog sync complete. categories=${categories.length}, productsCreated=${createdProducts}, resetMode=${shouldReset}`
    );
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
