// Adds recommendation attributes to EXISTING products.
// Only writes the `recommendation` sub-document ($set on that key); name,
// price, stock, images, description etc. are never touched.
//   node scripts/migrateRecommendationData.js            # fill products lacking data
//   node scripts/migrateRecommendationData.js --dry-run  # show what would change
//   node scripts/migrateRecommendationData.js --force    # also overwrite unreviewed data
// Products an admin marked reviewed:true are never overwritten.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import { recommendationData } from '../seed/recommendationData.js';
import { missingCritical } from '../services/recommendationService.js';

dotenv.config();
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

async function run() {
  await connectDB();
  const summary = { updated: 0, skippedExisting: 0, skippedReviewed: 0, noData: [] };
  const products = await Product.find({});
  for (const p of products) {
    const data = recommendationData[p.name];
    if (!data) { if (p.category !== 'planters') summary.noData.push(p.name); continue; }
    if (p.recommendation?.reviewed) { summary.skippedReviewed++; continue; }
    if (!force && missingCritical(p.toObject()).length === 0) { summary.skippedExisting++; continue; }
    if (!dryRun) await Product.updateOne({ _id: p._id }, { $set: { recommendation: { ...data, dataSource: 'seed', reviewed: false } } });
    summary.updated++;
  }
  console.log(dryRun ? '[dry run]' : '[done]', summary);
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
