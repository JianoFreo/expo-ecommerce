const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=14.6110&longitude=120.9962&current_weather=true'

let isLoading = true;
fetch(apiUrl)
    .then(response => { return response.json(); })
    .then(my_data => {
        console.log('Current weather data temperature:', my_data.current_weather.temperature);
        console.log('the entire data: ', my_data);
    }).catch(error => {
        console.error('Error fetching weather data:', error);
    }).finally(() => {
        console.log('Fetch attempt completed.');
        isLoading = false;
    });

async function myFunction() {
    console.log('A')
    const response = await fetch(apiUrl)
    console.log(response, 'B')
}

await myFunction()
console.log('C')