import axios from 'axios';

async function testAPI() {
    try {
        const response = await axios.get('http://localhost:5001/api/boxes/availability/1');
        console.log('Availability for Room 1:');
        console.log(response.data);
    } catch (err) {
        console.error('Error fetching availability:', err.message);
    }
}

testAPI();
