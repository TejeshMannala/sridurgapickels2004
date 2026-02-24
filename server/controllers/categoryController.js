const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { syncCatalog } = require('../scripts/seedCatalog');

let catalogSyncPromise = null;

const ensureCatalogAvailable = async () => {
  const autoSeedEnabled = String(process.env.AUTO_SEED_CATALOG || 'true').toLowerCase() !== 'false';
  if (!autoSeedEnabled) return;

  const [categoryCount, productCount] = await Promise.all([
    Category.estimatedDocumentCount(),
    Product.estimatedDocumentCount()
  ]);

  if (categoryCount > 0 && productCount > 0) return;

  if (!catalogSyncPromise) {
    catalogSyncPromise = syncCatalog({ shouldConnect: false, shouldReset: false })
      .catch((error) => {
        console.error(`On-demand catalog seed (categories) failed: ${error.message}`);
      })
      .finally(() => {
        catalogSyncPromise = null;
      });
  }

  await catalogSyncPromise;
}

const getCategories = async (req, res) => {
  try {
    await ensureCatalogAvailable();
    const categories = await Category.find({}).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory };
