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
            price: vehicle.price,
            imageUrl: vehicle.imageUrl,
            publisherId: vehicle.publisherId,
            postedOn: vehicle.postedOn
        };
    })
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Product Validation Error';
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
        priceInterval: undefined,
        makes: undefined,
        yearInterval: undefined,
        mileageInterval: undefined
    };

    const decorateFilterArgs = (queryArguments, filterArgs, arg) =>
        queryArguments[arg]
            ? filterArgs[arg] = queryArguments[arg]
            : filterArgs;

    ['category', 'priceInterval', 'makes', 'yearInterval', 'mileageInterval']
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

exports.editVehicle = (vehicle) => Vehicle.findByIdAndUpdate(
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
        priceInterval: undefined,
        makes: undefined,
        yearInterval: undefined,
        mileageInterval: undefined
    };

    const decorateFilterArgs = (filter, filterArgs, arg) =>
        filter[arg]
            ? filterArgs[arg] = filter[arg]
            : filterArgs;
            
    ['category', 'priceInterval', 'makes', 'yearInterval', 'mileageInterval']
        .forEach(arg => decorateFilterArgs(filter, filterArgs, arg));
        
    findQuery = createFindQuery(...Object.values(filter));
    
    return Vehicle.find(findQuery).countDocuments();
}

exports.getCategories = () => Vehicle.schema.path('category').enumValues;

exports.getAllMakes = () => Vehicle.distinct('make')
    .then(makes => makes)
    .catch(err => []);


function createFindQuery(category, priceInterval, makes, yearInterval, mileageInterval) {

    let findQuery = {};

    if (category) {

        findQuery = { ...findQuery, category: { $regex: new RegExp(`^${category}$`, 'i') } };

    }

    if (priceInterval) {
        
        findQuery = { ...findQuery, price: { $gte: Number(priceInterval[0]), $lte: Number(priceInterval[1]) } };

    }

    if (makes) {

        findQuery = { ...findQuery, make: { $in: makes } };

    }

    if (yearInterval) {
        
        findQuery = { ...findQuery, year: { $gte: Number(yearInterval[0]), $lte: Number(yearInterval[1]) } };

    }

    if (mileageInterval) {

        findQuery = { ...findQuery, mileageInterval: { $gte: Number(mileageInterval[0]), $lte: Number(mileageInterval[1]) } };

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