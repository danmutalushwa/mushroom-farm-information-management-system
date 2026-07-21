const ProductionBatch = require('../models/ProductionBatch');
const Harvest = require('../models/Harvest');
const ProductionLoss = require('../models/ProductionLoss');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { validateProductionBatch, validateHarvest, validateProductionLoss } = require('../validators/production.validator');

/**
 * Production Service
 * Handles all production management business logic
 */
class ProductionService {
    /**
     * Create a new production batch
     */
    async createBatch(batchData, userId) {
        // Validate input
        const validation = validateProductionBatch(batchData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Check if batch number already exists
        if (batchData.batchNumber) {
            const existing = await ProductionBatch.findOne({ batchNumber: batchData.batchNumber });
            if (existing) {
                throw new AppError('Batch number already exists', 400);
            }
        }

        const batch = await ProductionBatch.create({
            ...batchData,
            createdBy: userId
        });

        logger.info(`Production batch created: ${batch.batchNumber}`, {
            batchId: batch._id,
            mushroomType: batch.mushroomType,
            createdBy: userId
        });

        return batch;
    }

    /**
     * Get all production batches with pagination and filters
     */
    async getAllBatches(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (filters.status) filter.status = filters.status;
        if (filters.mushroomType) filter.mushroomType = filters.mushroomType;
        if (filters.productionRoom) filter.productionRoom = filters.productionRoom;
        
        // Date range filters
        if (filters.startDate || filters.endDate) {
            filter.startDate = {};
            if (filters.startDate) filter.startDate.$gte = new Date(filters.startDate);
            if (filters.endDate) filter.startDate.$lte = new Date(filters.endDate);
        }

        // Search by batch number
        if (filters.search) {
            filter.batchNumber = { $regex: filters.search, $options: 'i' };
        }

        const [batches, total] = await Promise.all([
            ProductionBatch.find(filter)
                .populate('createdBy', 'fullName email')
                .populate('harvests.recordedBy', 'fullName')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            ProductionBatch.countDocuments(filter)
        ]);

        // Update status for each batch
        batches.forEach(batch => batch.updateStatus());

        return {
            batches,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get production batch by ID
     */
    async getBatchById(batchId) {
        const batch = await ProductionBatch.findById(batchId)
            .populate('createdBy', 'fullName email')
            .populate('harvests.recordedBy', 'fullName');

        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Update status
        batch.updateStatus();
        await batch.save();

        return batch;
    }

    /**
     * Get production batch by batch number
     */
    async getBatchByNumber(batchNumber) {
        const batch = await ProductionBatch.findOne({ batchNumber })
            .populate('createdBy', 'fullName email')
            .populate('harvests.recordedBy', 'fullName');

        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        return batch;
    }

    /**
     * Update production batch
     */
    async updateBatch(batchId, updateData, userId) {
        const batch = await ProductionBatch.findById(batchId);
        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Don't allow updates to completed or cancelled batches
        if (batch.status === 'Completed' || batch.status === 'Cancelled') {
            throw new AppError(`Cannot update a ${batch.status.toLowerCase()} batch`, 400);
        }

        // Update fields
        const allowedFields = ['mushroomType', 'spawnType', 'productionRoom', 'startDate', 'expectedHarvestDate', 'spawnQuantity', 'notes'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                batch[field] = updateData[field];
            }
        });

        // Update status
        batch.updateStatus();
        await batch.save();

        logger.info(`Production batch updated: ${batch.batchNumber}`, {
            batchId: batch._id,
            updatedBy: userId
        });

        return batch;
    }

    /**
     * Add harvest to production batch
     */
    async addHarvest(batchId, harvestData, userId) {
        // Validate harvest
        const validation = validateHarvest(harvestData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const batch = await ProductionBatch.findById(batchId);
        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Don't allow harvests on cancelled or completed batches
        if (batch.status === 'Cancelled') {
            throw new AppError('Cannot add harvest to a cancelled batch', 400);
        }

        // Add harvest to batch
        batch.addHarvest({
            ...harvestData,
            recordedBy: userId
        });

        await batch.save();

        // Also save as separate harvest record
        const harvest = await Harvest.create({
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            harvestDate: harvestData.harvestDate || new Date(),
            quantity: harvestData.quantity,
            grade: harvestData.grade || 'A',
            qualityRemarks: harvestData.qualityRemarks || null,
            recordedBy: userId,
            notes: harvestData.notes || null
        });

        logger.info(`Harvest added to batch: ${batch.batchNumber}`, {
            batchId: batch._id,
            harvestId: harvest._id,
            quantity: harvestData.quantity,
            recordedBy: userId
        });

        return {
            batch,
            harvest
        };
    }

    /**
     * Record production loss
     */
    async recordLoss(batchId, lossData, userId) {
        // Validate loss
        const validation = validateProductionLoss(lossData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const batch = await ProductionBatch.findById(batchId);
        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Create loss record
        const loss = await ProductionLoss.create({
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            lossDate: lossData.lossDate || new Date(),
            lossQuantity: lossData.lossQuantity,
            lossReason: lossData.lossReason,
            description: lossData.description || null,
            recordedBy: userId
        });

        // Update batch production loss
        batch.productionLoss += lossData.lossQuantity;
        if (lossData.description) {
            batch.lossReasons = batch.lossReasons 
                ? `${batch.lossReasons}; ${lossData.description}`
                : lossData.description;
        }
        await batch.save();

        logger.info(`Production loss recorded: ${batch.batchNumber}`, {
            batchId: batch._id,
            lossId: loss._id,
            lossQuantity: lossData.lossQuantity,
            lossReason: lossData.lossReason,
            recordedBy: userId
        });

        return {
            batch,
            loss
        };
    }

    /**
     * Update batch status
     */
    async updateBatchStatus(batchId, status, userId) {
        const batch = await ProductionBatch.findById(batchId);
        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Validate status transition
        const validTransitions = {
            'Planned': ['In Progress', 'Cancelled'],
            'In Progress': ['Ready for Harvest', 'Cancelled'],
            'Ready for Harvest': ['Harvested', 'Cancelled'],
            'Harvested': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': []
        };

        if (!validTransitions[batch.status].includes(status)) {
            throw new AppError(`Cannot transition from '${batch.status}' to '${status}'`, 400);
        }

        batch.status = status;

        // If status is Completed, set actual harvest date
        if (status === 'Completed' && !batch.actualHarvestDate) {
            batch.actualHarvestDate = new Date();
        }

        await batch.save();

        logger.info(`Batch status updated: ${batch.batchNumber}`, {
            batchId: batch._id,
            oldStatus: batch.status,
            newStatus: status,
            updatedBy: userId
        });

        return batch;
    }

    /**
     * Get batch statistics
     */
    async getBatchStatistics(batchId) {
        const batch = await this.getBatchById(batchId);
        
        const totalHarvest = batch.totalHarvest;
        const totalLoss = batch.productionLoss;
        const totalProduced = totalHarvest + totalLoss;
        const yieldEfficiency = batch.getYieldEfficiency();
        const harvestCount = batch.harvests.length;

        // Get harvests by grade
        const gradeDistribution = {
            A: 0,
            B: 0,
            C: 0
        };
        batch.harvests.forEach(h => {
            if (gradeDistribution[h.grade] !== undefined) {
                gradeDistribution[h.grade] += h.quantity;
            }
        });

        return {
            batchNumber: batch.batchNumber,
            mushroomType: batch.mushroomType,
            status: batch.status,
            totalHarvest,
            totalLoss,
            totalProduced,
            yieldEfficiency: yieldEfficiency.toFixed(2),
            harvestCount,
            gradeDistribution,
            startDate: batch.startDate,
            expectedHarvestDate: batch.expectedHarvestDate,
            actualHarvestDate: batch.actualHarvestDate
        };
    }

    /**
     * Delete production batch
     */
    async deleteBatch(batchId, userId) {
        const batch = await ProductionBatch.findById(batchId);
        if (!batch) {
            throw new AppError('Production batch not found', 404);
        }

        // Don't allow deletion of completed batches
        if (batch.status === 'Completed') {
            throw new AppError('Cannot delete a completed batch', 400);
        }

        // Delete associated harvests and losses
        await Harvest.deleteMany({ batchId: batch._id });
        await ProductionLoss.deleteMany({ batchId: batch._id });
        
        // Delete batch
        await ProductionBatch.findByIdAndDelete(batchId);

        logger.info(`Production batch deleted: ${batch.batchNumber}`, {
            batchId: batch._id,
            deletedBy: userId
        });

        return batch;
    }
}

module.exports = new ProductionService();