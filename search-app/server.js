

const express = require('express');
const httpClient = require('axios');
const jsonParser = require('body-parser');
const cross = require('cors');
const app = express();


app.use(cross());
app.use(jsonParser.json());

const mysqlDriver = require('mysql');
const connection = mysqlDriver.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'M@ni$hKum4r!2024#',
    database: 'searchApp'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('MySQL database connection established successfully');
});

app.post('/search', async (request, response) => {
    const { searchMethod, searchInput } = request.body;
    let requestUrl = '';

    if (searchMethod === 'pincode') {
        requestUrl = `https://api.postalpincode.in/pincode/${searchInput}`;
    } else if (searchMethod === 'name') {
        requestUrl = `https://api.postalpincode.in/postoffice/${searchInput}`;
    }

    try {
        const apiResponse = await httpClient.get(requestUrl);
        const responseData = apiResponse.data;

        if (responseData[0].Status === "Success") {
            response.json(responseData[0].PostOffice);
        } else {
            response.status(404).json({ message: 'No data found for the specified search.' });
        }
    } catch (error) {
        console.error('Error during API call:', error);
        response.status(500).json({ message: 'An issue occurred while fetching the data.' });
    }
});

app.post('/favourite', (request, response) => {
    const { officeName, pinCode, officeType, deliveryStatus, districtName, regionName, stateName } = request.body;

    if (!officeName || !pinCode) {
        return response.status(400).json({ message: 'Both office name and pincode are required.' });
    }

    const insertQuery = `
        INSERT INTO favourites (officeName, pinCode, officeType, deliveryStatus, districtName, regionName, stateName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertQuery, [officeName, pinCode, officeType, deliveryStatus, districtName, regionName, stateName], (err, result) => {
        if (err) {
            console.error('Database insertion error:', err);
            return response.status(500).json({ message: 'Failed to save data to the database' });
        }
        response.status(200).json({ message: 'Marked as favourite successfully!' });
    });
});

app.get('/favourites', (request, response) => {
    const fetchQuery = 'SELECT * FROM favourites';

    connection.query(fetchQuery, (err, results) => {
        if (err) {
            console.error('Error retrieving favourites:', err);
            return response.status(500).json({ message: 'Could not retrieve favourites' });
        }
        response.json(results);
    });
});
const port = 3000;
app.listen(port, () => {
    console.log(`server is started ${port}`);
});
