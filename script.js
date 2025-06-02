function selectCountry() {
    const svgObject = document.getElementById('svgMap');

    svgObject.addEventListener('load', () => {
        const svgDoc = svgObject.contentDocument;
        const svgPaths = svgDoc.querySelectorAll('path');
            let numberOfCountry = 0

        svgPaths.forEach((path) => {
            const countryId = path.getAttribute('id');
            const countryName = path.getAttribute('name');
            if(!countryId || !countryName) {
                return;
            }
            console.log('Country ID:', countryId+ ', Name:', countryName);
            numberOfCountry++;
            console.log('Total number of countries:', numberOfCountry);
            
            path.addEventListener('click', () => {
                path.style.fill = 'red'; // Change color on click
                console.log(`Clicked on ${countryName} (ID: ${countryId})`);
            });
        });
    });
}

selectCountry();
