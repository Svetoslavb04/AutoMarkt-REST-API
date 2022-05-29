const Vehicle = require('../models/Vehicle');

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

exports.getVehicles = (queryArguments) => {

    let findQuery;
    let sortQuery;

    const filterArgs = {
        category: undefined,
        priceGreaterThan: undefined,
        priceLowerThan: undefined,
        makes: undefined,
        yearGreaterThan: undefined,
        yearLowerThan: undefined,
        mileageGreaterThan: undefined,
        mileageLowerThan: undefined,
    };

    const decorateFilterArgs = (queryArguments, filterArgs, arg) =>
        queryArguments[arg]
            ? filterArgs[arg] = queryArguments[arg]
            : filterArgs;

    ['category', 'priceGreaterThan', 'priceLowerThan', 'makes', 'yearGreaterThan', 'yearLowerThan', 'mileageGreaterThan', 'mileageLowerThan']
        .forEach(arg => decorateFilterArgs(queryArguments, filterArgs, arg));

    findQuery = createFindQuery(...Object.values(filterArgs));

    if (queryArguments.sort) sortQuery = createSortQuery(queryArguments.sort)

    if (queryArguments.page && queryArguments.pageSize) {

        if (isNaN(queryArguments.page) || isNaN(queryArguments.pageSize) || queryArguments.page <= 0 || queryArguments.pageSize <= 0) {

            return new Promise((resolve, reject) => {
                resolve([]);
            })

        }

        return Vehicle.find(findQuery)
            .sort(sortQuery)
            .skip((queryArguments.page - 1) * queryArguments.pageSize)
            .limit(queryArguments.pageSize)
            .select('-__v')
            .lean()
            .then(vehicles => vehicles)
            .catch(err => []);
    }

    return Vehicle.find(findQuery)
        .sort(sortQuery)
        .select('-__v')
        .lean()
        .then(vehicles => vehicles)
        .catch(err => []);
}

exports.getVehiclesBySearch = (search, page, pageSize) => {

    const searchParts = Array.isArray(search) ? search : [search];

    const numberParts = searchParts
        .filter(p => p.length >= 2)
        .reduce((arr, curr) => !isNaN(curr) ? [Number(curr), ...arr] : arr, []);

    let stringPartsRegexes = searchParts
        .filter(p => p.length >= 2)
        .reduce((arr, curr) => isNaN(curr) ? [new RegExp(curr, 'i'), ...arr] : arr, []);

    const findQuery = {
        $or: [
            { make: { $in: stringPartsRegexes } },
            { model: { $in: stringPartsRegexes } },
            { mileage: { $in: numberParts } },
            { year: { $in: numberParts } },
            { price: { $in: numberParts } },
            { VIN: { $in: stringPartsRegexes } },
        ]
    };

    let vehiclesPromise;

    if (page && pageSize) {

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {

            return new Promise((resolve, reject) => {
                resolve([]);
            })

        }

        vehiclesPromise = Vehicle.find(findQuery)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .select('-__v')
            .lean();

    } else {

        vehiclesPromise = Vehicle.find(findQuery)
            .select('-__v')
            .lean();

    }


    return vehiclesPromise
        .then(vehicles => {

            if (vehicles.length == 0) {
                return [];
            }

            let resultVehicles = [];

            vehicles.forEach(v => {
                if (stringPartsRegexes.length > 0) {
                    if (
                        stringPartsRegexes.some(r => r.test(v.make)) ||
                        stringPartsRegexes.some(r => r.test(v.model)) ||
                        stringPartsRegexes.some(r => r.test(v.VIN))
                    ) {

                        resultVehicles.push(v);

                    }
                } else {

                    resultVehicles = vehicles;

                }
            })

            const meta = {
                minYear: resultVehicles[0].year,
                maxYear: resultVehicles[0].year,
                minPrice: resultVehicles[0].price,
                maxPrice: resultVehicles[0].price,
                minMileage: resultVehicles[0].mileage,
                maxMileage: resultVehicles[0].mileage
            };

            meta.makes = resultVehicles.reduce((arr, curr) => arr.includes(curr.make) ? arr : [curr.make, ...arr], []);

            if (resultVehicles.length > 0) {

                meta.minYear = resultVehicles
                    .reduce((prev, curr) => prev < curr.year ? prev : curr.year, resultVehicles[0].year);
                meta.maxYear = resultVehicles
                    .reduce((prev, curr) => prev > curr.year ? prev : curr.year, resultVehicles[0].year);
                meta.minPrice = resultVehicles
                    .reduce((prev, curr) => prev < curr.price ? prev : curr.price, resultVehicles[0].price);
                meta.maxPrice = resultVehicles
                    .reduce((prev, curr) => prev > curr.price ? prev : curr.price, resultVehicles[0].price);
                meta.minMileage = resultVehicles
                    .reduce((prev, curr) => prev < curr.mileage ? prev : curr.mileage, resultVehicles[0].mileage);
                meta.maxMileage = resultVehicles
                    .reduce((prev, curr) => prev > curr.mileage ? prev : curr.mileage, resultVehicles[0].mileage);

            }

            meta.count = resultVehicles.length;

            return { vehicles: resultVehicles, meta };

        })
        .catch(err => {
            return [];
        })
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

    let findQuery;

    const filterArgs = {
        category: undefined,
        priceGreaterThan: undefined,
        priceLowerThan: undefined,
        makes: undefined,
        yearGreaterThan: undefined,
        yearLowerThan: undefined,
        mileageGreaterThan: undefined,
        mileageLowerThan: undefined,
    };

    const decorateFilterArgs = (filter, filterArgs, arg) =>
        filter[arg]
            ? filterArgs[arg] = filter[arg]
            : filterArgs;

    ['category', 'priceGreaterThan', 'priceLowerThan', 'makes', 'yearGreaterThan', 'yearLowerThan', 'mileageGreaterThan', 'mileageLowerThan']
        .forEach(arg => decorateFilterArgs(filter, filterArgs, arg));

    findQuery = createFindQuery(...Object.values(filter));

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

function createFindQuery(category, priceGreaterThan, priceLowerThan, makes, yearGreaterThan, yearLowerThan, mileageGreaterThan, mileageLowerThan) {

    let findQuery = {};

    if (category) {

        findQuery = { ...findQuery, category: { $regex: new RegExp(`^${category}$`, 'i') } };

    }

    if (priceGreaterThan && !isNaN(priceGreaterThan)) {

        findQuery = { ...findQuery, price: { ...findQuery.price } };
        findQuery['price']['$gte'] = Number(priceGreaterThan);

    }

    if (priceLowerThan && !isNaN(priceLowerThan)) {

        findQuery = { ...findQuery, price: { ...findQuery.price } };
        findQuery['price']['$lte'] = Number(priceLowerThan);
    }

    if (makes) {

        findQuery = { ...findQuery, make: { $in: makes } };

    }

    if (yearGreaterThan && !isNaN(yearGreaterThan)) {

        findQuery = { ...findQuery, year: { ...findQuery.year } };
        findQuery['year']['$gte'] = Number(yearGreaterThan);

    }

    if (yearLowerThan && !isNaN(yearLowerThan)) {

        findQuery = { ...findQuery, year: { ...findQuery.year } };
        findQuery['year']['$lte'] = Number(yearLowerThan);
    }

    if (mileageGreaterThan && !isNaN(mileageGreaterThan)) {

        findQuery = { ...findQuery, mileage: { ...findQuery.mileage } };
        findQuery['mileage']['$gte'] = Number(mileageGreaterThan);

    }

    if (mileageLowerThan && !isNaN(mileageLowerThan)) {

        findQuery = { ...findQuery, mileage: { ...findQuery.mileage } };
        findQuery['mileage']['$lte'] = Number(mileageLowerThan);
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