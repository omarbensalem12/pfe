const db = require("../models");
const Country = db.country;

exports.create = async (req, res) => {
    try {
        // Extract data from the request body
        const { name, states } = req.body;

        // Check if the country already exists
        const existingCountry = await Country.findOne({ name: name });

        if (!existingCountry) {
            // Scenario 1: Create the whole object
            const newCountry = new Country(req.body);
            const savedCountry = await newCountry.save();
            res.status(201).json(savedCountry);
        } else {
            // Check if the state already exists in the country
            const existingState = existingCountry.states.find(state => state.name === states[0].name);

            if (!existingState) {
                // Scenario 2: Add the state with its cities to the existing country
                existingCountry.states.push({
                    name: states[0].name,
                    cities: states[0].cities.map(city => ({
                        name: city.name,
                        areaCode: city.areaCode,
                    })),
                });

                const updatedCountry = await existingCountry.save();
                res.json(updatedCountry);
            } else {
                // Scenario 3: Add cities to the existing state in the existing country
                existingState.cities.push(
                    ...states[0].cities.map(city => ({
                        name: city.name,
                        areaCode: city.areaCode,
                    }))
                );

                const updatedCountry = await existingCountry.save();
                res.json(updatedCountry);
            }
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.update = (req, res) => {
    try {
        Country.findByIdAndUpdate(req.body.id, req.body)
            .then((country) => {
                if (country) {
                    res.json(country);
                } else {
                    res.status(404).json({ message: 'Country not found' });
                }
            })
            .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
        console.log(error)
    }
}


exports.getCounties = async (req, res) => {
    try {
        const countries = await Country.find({}, 'name');
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getStates = async (req, res) => {
    const { countryId } = req.params;
    try {
        const country = await Country.findById(countryId, 'states._id  states.name');
        res.json(country.states);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getCities = async (req, res) => {
    const { countryId, stateId } = req.params;
    try {
        const country = await Country.findById(countryId, 'states');
        const state = country.states.find(s => s._id.toString() === stateId);
        res.json(state.cities);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.delete = async (req, res) => {
    const countryId = req.query.id;
    Country.findByIdAndDelete(countryId)
        .exec()
        .then((blog) => {
            if (blog) {
                res.status(204).json({ message: 'Country was deleted' });
            } else {
                res.status(404).json({ message: 'Country not found' });
            }
        })
        .catch((error) => res.status(500).json({ error: error.message }));
}

exports.getAll = async (req, res) => {
    try {
        const country = await Country.find({});
        res.status(200).json(country);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}