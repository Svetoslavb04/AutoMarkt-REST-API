const Vehicle = require('../models/Vehicle');

exports.getVehicles = async (queryArguments) => {

    if (queryArguments.search) {
        return await this.getVehiclesBySearch(queryArguments.search, queryArguments.sort, queryArguments.page, queryArguments.pageSize);
    }

    let vehiclesPromise;

    const findQuery = createFilterFindQuery(queryArguments.filter);

    const sortQuery = createSortQuery(queryArguments.sort);

    const meta = await this.getAggregatedDataPerFilter(findQuery);

    let returnedData = { meta, filter: queryArguments.filter };

    if (queryArguments.page && queryArguments.pageSize) {

        if (isNaN(queryArguments.page) || isNaN(queryArguments.pageSize) || queryArguments.page <= 0 || queryArguments.pageSize <= 0) {

            return new Promise((resolve, reject) => {
                resolve([]);
            })

        } else {

            vehiclesPromise = Vehicle.find(findQuery)
                .sort(sortQuery)
                .skip((queryArguments.page - 1) * queryArguments.pageSize)
                .limit(queryArguments.pageSize);
        }


    } else {

        vehiclesPromise = Vehicle.find(findQuery)
            .sort(sortQuery);

    }

    try {

        const vehicles = await vehiclesPromise.select('-__v').lean();

        return { ...returnedData, vehicles };

    } catch (error) { return returnedData }
}

exports.createVehicle = (vehicle) => Vehicle.create(vehicle)
    .then(vehicle => {
        return {
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            description: vehicle.description,
            mileage: vehicle.mileage,
            year: vehicle.year,
            category: vehicle.category,
            VIN: vehicle.VIN,
            price: Number(vehicle.price.toFixed(2)),
            imageUrl: vehicle.imageUrl,
            publisherId: vehicle.publisherId,
            postedOn: vehicle.postedOn
        };
    })
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Vehicle Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing vehicle';

        }
        else {

            error.message = err.name;

        }

        throw error;
    });

exports.getVehiclesBySearch = async (searchTerm, sort, page, pageSize) => {

    const sortQuery = createSortQuery(sort);

    const search = Array.isArray(searchTerm) ? searchTerm.join(' ') : searchTerm;

    const findQuery = { $text: { $search: `\"${search}\"` } };

    let countOfAll;
    try {
        countOfAll = await Vehicle.find(findQuery).countDocuments();
    } catch (error) {
        countOfAll = 0;
    }

    let vehiclesPromise;

    if (page && pageSize) {

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {

            return new Promise((resolve, reject) => {
                resolve([]);
            })

        }

        vehiclesPromise = Vehicle.find(findQuery)
            .sort(sortQuery)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .select('-__v')
            .lean();

    } else {

        vehiclesPromise = Vehicle.find(findQuery)
            .sort(sortQuery)
            .select('-__v')
            .lean();

    }

    try {
        const vehicles = await vehiclesPromise;
        
        if (vehicles.length == 0) {
            return { vehicles: [], meta: { count: 0, makes: [] } };
        }

        const meta = getMetaDataFromVehicles(vehicles);

        return { vehicles, meta: { count: countOfAll, ...meta } };


    } catch (error) {
        return { vehicles: [], meta: { count: 0, makes: [] } };
    }
}

exports.getLatestVehicles = (count) => !isNaN(count) && count > 0
    ? Vehicle.find()
        .sort({ postedOn: 'desc' })
        .limit(count)
        .lean()
        .then(vehicles => vehicles)
        .catch(err => [])
    : new Promise((resolve, reject) => {
        resolve([]);
    })

exports.getVehicle = (_id) => Vehicle.findById(_id)
    .select('-__v')
    .lean()
    .then(vehicle => vehicle)
    .catch(err => null);

exports.editVehicle = (vehicle) => {

    if (vehicle.price && !isNaN(vehicle.price)) vehicle.price = vehicle.price.toFixed(2);

    return Vehicle.findByIdAndUpdate(
        vehicle._id, vehicle,
        {
            runValidators: true,
            new: true
        })
        .then(vehicle => vehicle)
        .catch(err => {

            const error = {};

            if (err.name == 'ValidationError') {

                error.message = 'Vehicle Validation Error';
                error.errors = {};

                const keys = Object.keys(err.errors);

                keys.forEach(key => {

                    if (err.errors[key].properties) {

                        error.errors[key] = err.errors[key].properties.message;

                    } else {

                        error.errors[key] = 'Invalid data type';

                    }

                });

            } else if (err.name == 'MongoServerError') {

                error.message = 'Existing vehicle';

            }
            else {

                error.message = err.name;

            }

            throw error;
        });
}

exports.deleteVehicle = (_id) => Vehicle.findByIdAndDelete(_id)
    .then(vehicle => {
        if (vehicle == null) {
            throw Error;
        }
    })
    .catch(err => {
        throw {
            message: 'Invalid vehicle'
        }
    });

exports.getVehiclesCount = (filter) => {

    const findQuery = createFilterFindQuery(filter);

    return Vehicle.find(findQuery).countDocuments();
}

exports.getUsedCategories = () => Vehicle.distinct('category')
    .then(categories => categories)
    .catch(err => []);

exports.getAllCategories = () => Vehicle.schema.path('category').enumValues

exports.getAllMakes = () => Vehicle.distinct('make')
    .then(makes => makes)
    .catch(err => []);

exports.getAggregatedDataPerCategory = async (category) => {

    let data = {};

    let pipelineStages = [];

    if (category) {

        pipelineStages.push({ $match: { category: { $regex: new RegExp(`^${category}$`, 'i') } } });

    }

    pipelineStages.push({
        $group: {
            _id: category ? '$category' : 'All Categories',
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            minYear: { $min: '$year' },
            maxYear: { $max: '$year' },
            minMileage: { $min: '$mileage' },
            maxMileage: { $max: '$mileage' },
            count: { $count: {} }
        }
    });

    pipelineStages.push({
        $project: {
            _id: 0,
            category: '$_id',
            minPrice: 1,
            maxPrice: 1,
            minYear: 1,
            maxYear: 1,
            minMileage: 1,
            maxMileage: 1,
            count: 1
        }
    });

    try {

        data = (await Vehicle.aggregate([pipelineStages]))[0];

        try {

            data.makes = await Vehicle.find(category ? {
                category: { $regex: new RegExp(`^${category}$`, 'i') }
            } : {})
                .distinct('make');

        } catch (err) {

            data.makes = [];

        }


    } catch (err) { }

    return data ? data : { message: 'Category not found' };

}

exports.getAggregatedDataPerFilter = async (filter) => {

    let data = {};

    let pipelineStages = [];
    pipelineStages.push({ $match: { ...filter } });

    pipelineStages.push({
        $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            minYear: { $min: '$year' },
            maxYear: { $max: '$year' },
            minMileage: { $min: '$mileage' },
            maxMileage: { $max: '$mileage' },
            count: { $count: {} }
        }
    });

    pipelineStages.push({
        $project: {
            _id: 0,
            minPrice: 1,
            maxPrice: 1,
            minYear: 1,
            maxYear: 1,
            minMileage: 1,
            maxMileage: 1,
            count: 1
        }
    });

    try {

        data = (await Vehicle.aggregate([pipelineStages]))[0] || { count: 0 };

        try {

            data.makes = await Vehicle.find(filter)
                .distinct('make');

        } catch (err) {

            data.makes = [];

        }


    } catch (err) { console.log(err); }

    return data;

}

function createFilterFindQuery(filter) {

    let findQuery = {};

    if (filter.category) {

        findQuery = { ...findQuery, category: { $regex: new RegExp(`^${filter.category}$`, 'i') } };

    }

    if (filter.priceGreaterThan && !isNaN(filter.priceGreaterThan)) {

        findQuery = { ...findQuery, price: { ...findQuery.price } };
        findQuery['price']['$gte'] = Number(filter.priceGreaterThan);

    }

    if (filter.priceLowerThan && !isNaN(filter.priceLowerThan)) {

        findQuery = { ...findQuery, price: { ...findQuery.price } };
        findQuery['price']['$lte'] = Number(filter.priceLowerThan);
    }

    if (filter.makes) {

        findQuery = { ...findQuery, make: { $in: Array.isArray(filter.makes) ? filter.makes : [filter.makes] } };

    }

    if (filter.yearGreaterThan && !isNaN(filter.yearGreaterThan)) {

        findQuery = { ...findQuery, year: { ...findQuery.year } };
        findQuery['year']['$gte'] = Number(filter.yearGreaterThan);

    }

    if (filter.yearLowerThan && !isNaN(filter.yearLowerThan)) {

        findQuery = { ...findQuery, year: { ...findQuery.year } };
        findQuery['year']['$lte'] = Number(filter.yearLowerThan);
    }

    if (filter.mileageGreaterThan && !isNaN(filter.mileageGreaterThan)) {

        findQuery = { ...findQuery, mileage: { ...findQuery.mileage } };
        findQuery['mileage']['$gte'] = Number(filter.mileageGreaterThan);

    }

    if (filter.mileageLowerThan && !isNaN(filter.mileageLowerThan)) {

        findQuery = { ...findQuery, mileage: { ...findQuery.mileage } };
        findQuery['mileage']['$lte'] = Number(filter.mileageLowerThan);
    }

    return findQuery;
}

function createSortQuery(sort) {

    let sortQuery = {};

    switch (sort) {
        case 'makeAsc':
            sortQuery = { make: 'asc' };
            break;
        case 'makeDesc':
            sortQuery = { make: 'desc' };
            break;
        case 'priceAsc':
            sortQuery = { price: 'asc' };
            break;
        case 'priceDesc':
            sortQuery = { price: 'desc' };
            break;
        case 'yearAsc':
            sortQuery = { year: 'asc' };
            break;
        case 'yearDesc':
            sortQuery = { year: 'desc' };
            break;
        case 'postedOnAsc':
            sortQuery = { postedOn: 'asc' };
            break;
        case 'postedOnDesc':
            sortQuery = { postedOn: 'desc' };
            break;
        default:
            sortQuery = {};
            break;
    }

    return sortQuery;
}

function getMetaDataFromVehicles(vehicles) {

    const meta = {
        minYear: vehicles[0].year,
        maxYear: vehicles[0].year,
        minPrice: vehicles[0].price,
        maxPrice: vehicles[0].price,
        minMileage: vehicles[0].mileage,
        maxMileage: vehicles[0].mileage
    };

    meta.makes = vehicles.reduce((arr, curr) => arr.includes(curr.make) ? arr : [curr.make, ...arr], []);

    if (vehicles.length > 0) {

        meta.minYear = vehicles
            .reduce((prev, curr) => prev < curr.year ? prev : curr.year, vehicles[0].year);
        meta.maxYear = vehicles
            .reduce((prev, curr) => prev > curr.year ? prev : curr.year, vehicles[0].year);
        meta.minPrice = vehicles
            .reduce((prev, curr) => prev < curr.price ? prev : curr.price, vehicles[0].price);
        meta.maxPrice = vehicles
            .reduce((prev, curr) => prev > curr.price ? prev : curr.price, vehicles[0].price);
        meta.minMileage = vehicles
            .reduce((prev, curr) => prev < curr.mileage ? prev : curr.mileage, vehicles[0].mileage);
        meta.maxMileage = vehicles
            .reduce((prev, curr) => prev > curr.mileage ? prev : curr.mileage, vehicles[0].mileage);

    }

    return meta;
}